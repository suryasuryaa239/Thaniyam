import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { SERVER_PRODUCTS } from '../data/serverProducts.js';
import { saveOrderToFallback, getOrderFromFallback } from '../data/mockOrderStore.js';

const router = express.Router();

// Helper to generate human-readable unique Order ID
const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TT-ORD-${dateStr}-${randomSuffix}`;
};

// POST /api/orders — Place a new order with server-verified prices
router.post('/', async (req, res) => {
  try {
    const { customer, items } = req.body;

    // 1. Validate Customer Details
    if (!customer) {
      return res.status(400).json({ success: false, message: 'Customer details are required.' });
    }

    const { fullName, mobile, email, addressLine, city, district, state, pincode, deliveryNotes } = customer;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name is required (min 2 characters).' });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile || !mobileRegex.test(mobile.trim())) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit Indian mobile number is required.' });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    if (!addressLine || addressLine.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Street address is required (min 5 characters).' });
    }

    if (!city || city.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Town or City is required.' });
    }

    if (!state || state.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'State is required.' });
    }

    const pincodeRegex = /^[1-9]\d{5}$/;
    if (!pincode || !pincodeRegex.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: 'A valid 6-digit PIN code is required.' });
    }

    // 2. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    // 3. Server-side authoritative pricing & verification
    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const trustedProduct = SERVER_PRODUCTS[item.id || item.productId];

      if (!trustedProduct) {
        return res.status(400).json({ 
          success: false, 
          message: `Product ID "${item.id || item.productId}" is not recognized in our catalog.` 
        });
      }

      if (!trustedProduct.inStock) {
        return res.status(400).json({ 
          success: false, 
          message: `Item "${trustedProduct.name}" is currently out of stock.` 
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1 || qty > 50) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid quantity for "${trustedProduct.name}". Must be between 1 and 50.` 
        });
      }

      const unitPrice = trustedProduct.price; // ALWAYS trusted server price
      const lineTotal = unitPrice * qty;
      calculatedSubtotal += lineTotal;

      verifiedOrderItems.push({
        productId: trustedProduct.id,
        name: trustedProduct.name,
        tamilName: trustedProduct.tamilName || '',
        weight: trustedProduct.weight || '',
        unitPrice: unitPrice,
        quantity: qty,
        lineTotal: lineTotal
      });
    }

    const orderId = generateOrderId();
    const orderData = {
      orderId,
      customer: {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim() : '',
        addressLine: addressLine.trim(),
        city: city.trim(),
        district: district ? district.trim() : '',
        state: state.trim(),
        pincode: pincode.trim(),
        deliveryNotes: deliveryNotes ? deliveryNotes.trim() : ''
      },
      items: verifiedOrderItems,
      pricing: {
        subtotal: calculatedSubtotal,
        shippingCharges: 0,
        totalAmount: calculatedSubtotal,
        currency: 'INR'
      },
      payment: {
        method: 'Pay on Delivery / Direct Confirmation',
        status: 'Pending'
      },
      orderStatus: 'Placed',
      createdAt: new Date().toISOString()
    };

    // 4. Save Order
    let savedOrder = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        savedOrder = await Order.create(orderData);
      } catch (dbErr) {
        console.warn('⚠️ [Orders] MongoDB save error, falling back to memory store:', dbErr.message);
        savedOrder = saveOrderToFallback(orderData);
      }
    } else {
      // Offline fallback store
      savedOrder = saveOrderToFallback(orderData);
    }

    console.log(`📦 [Orders] Order placed successfully: ${orderId} | Total: ₹${calculatedSubtotal}`);

    return res.status(201).json({
      success: true,
      message: 'Your traditional treats order has been placed successfully.',
      order: savedOrder
    });

  } catch (error) {
    console.error('❌ [Orders] Error processing order placement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to place your order due to an unexpected server error. Please try again.'
    });
  }
});

// GET /api/orders/:orderId — Retrieve an order by unique order ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    let foundOrder = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        foundOrder = await Order.findOne({ orderId }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Orders] DB lookup error:', dbErr.message);
      }
    }

    if (!foundOrder) {
      foundOrder = getOrderFromFallback(orderId);
    }

    if (!foundOrder) {
      return res.status(404).json({
        success: false,
        message: `Order "${orderId}" was not found in our records.`
      });
    }

    return res.json({
      success: true,
      order: foundOrder
    });

  } catch (error) {
    console.error('❌ [Orders] Error retrieving order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.'
    });
  }
});

export default router;
