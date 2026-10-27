import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { SERVER_PRODUCTS } from '../data/serverProducts.js';
import { 
  saveOrderToFallback, 
  getOrderFromFallback, 
  getAllOrdersFromFallback, 
  updateOrderStatusInFallback 
} from '../data/mockOrderStore.js';
import {
  getProductByIdFromStore,
  deductStockForOrderItemsInStore,
  restoreStockForOrderItemsInStore
} from '../data/mockProductStore.js';

const router = express.Router();

// Helper to generate human-readable unique Order ID
const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TT-ORD-${dateStr}-${randomSuffix}`;
};

// Helper to normalize Indian mobile numbers to 10 clean digits
export const normalizeMobile = (input) => {
  if (!input || typeof input !== 'string') return '';
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
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

    const cleanMobile = normalizeMobile(mobile);
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!cleanMobile || !mobileRegex.test(cleanMobile)) {
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

    // 3. Server-side authoritative pricing & stock verification
    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const prodId = item.id || item.productId;
      let trustedProduct = getProductByIdFromStore(prodId);
      if (!trustedProduct) {
        trustedProduct = SERVER_PRODUCTS[prodId];
      }

      if (!trustedProduct) {
        return res.status(400).json({ 
          success: false, 
          message: `Product ID "${prodId}" is not recognized in our catalog.` 
        });
      }

      if (trustedProduct.isActive === false) {
        return res.status(400).json({ 
          success: false, 
          message: `Item "${trustedProduct.name}" is currently discontinued or unavailable.` 
        });
      }

      const availableStock = typeof trustedProduct.stock === 'number' ? trustedProduct.stock : 50;

      if (availableStock <= 0 || !trustedProduct.inStock) {
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

      if (qty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${trustedProduct.name}". Only ${availableStock} units remaining (requested ${qty}). Please adjust your cart.`
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

    // Atomically deduct inventory stock
    try {
      deductStockForOrderItemsInStore(verifiedOrderItems);
    } catch (stockErr) {
      return res.status(400).json({
        success: false,
        message: stockErr.message || 'Failed to reserve stock for items in your cart.'
      });
    }

    const orderId = generateOrderId();
    const orderData = {
      orderId,
      customer: {
        fullName: fullName.trim(),
        mobile: cleanMobile,
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
      totalAmount: calculatedSubtotal,
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

// Rate limiting map for order tracking requests
const trackingAttempts = new Map();
const TRACKING_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_TRACKING_ATTEMPTS = 30; // max 30 attempts per 10 mins

const trackingRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const pastAttempts = (trackingAttempts.get(ip) || []).filter(time => now - time < TRACKING_WINDOW_MS);

  if (pastAttempts.length >= MAX_TRACKING_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many tracking attempts. Please wait a few minutes before trying again.'
    });
  }

  pastAttempts.push(now);
  trackingAttempts.set(ip, pastAttempts);
  next();
};

// Generic response for unmatched or invalid lookup to prevent account enumeration / guessing
const GENERIC_NOT_FOUND_MESSAGE = 'No matching order found for the provided Order ID and mobile number. Please verify your details.';

// POST /api/orders/track & GET /api/orders/track — Look up order with matching mobile verification
const handleTrackOrder = async (req, res) => {
  try {
    const rawOrderId = req.body?.orderId || req.query?.orderId;
    const rawMobile = req.body?.mobile || req.query?.mobile;

    // 1. Validate inputs
    if (!rawOrderId || !rawOrderId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required to track an order.'
      });
    }

    if (!rawMobile || !rawMobile.trim()) {
      return res.status(400).json({
        success: false,
        message: 'The mobile number used during order placement is required.'
      });
    }

    const cleanMobile = normalizeMobile(rawMobile);
    if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number.'
      });
    }

    const cleanOrderId = rawOrderId.trim();

    // 2. Fetch order from MongoDB or fallback store
    let foundOrder = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        foundOrder = await Order.findOne({
          orderId: { $regex: new RegExp(`^${cleanOrderId}$`, 'i') }
        }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Orders] DB tracking lookup error:', dbErr.message);
      }
    }

    if (!foundOrder) {
      foundOrder = getOrderFromFallback(cleanOrderId);
    }

    // 3. Constant generic message: do not reveal if orderId exists or phone was wrong
    if (!foundOrder) {
      return res.status(404).json({
        success: false,
        message: GENERIC_NOT_FOUND_MESSAGE
      });
    }

    const orderStoredMobile = normalizeMobile(foundOrder.customer?.mobile || '');
    if (orderStoredMobile !== cleanMobile) {
      return res.status(404).json({
        success: false,
        message: GENERIC_NOT_FOUND_MESSAGE
      });
    }

    // 4. Return ONLY permitted tracking information (no DB internals, no full private address)
    const trackingDetails = {
      orderId: foundOrder.orderId,
      orderDate: foundOrder.createdAt,
      orderStatus: foundOrder.orderStatus || 'Placed',
      recipientName: foundOrder.customer?.fullName || 'Valued Customer',
      deliveryLocation: {
        city: foundOrder.customer?.city || '',
        district: foundOrder.customer?.district || '',
        state: foundOrder.customer?.state || '',
        pincode: foundOrder.customer?.pincode || ''
      },
      payment: {
        method: foundOrder.payment?.method || 'Pay on Delivery / Direct Confirmation',
        status: foundOrder.payment?.status || 'Pending'
      },
      pricing: {
        subtotal: foundOrder.pricing?.subtotal || 0,
        shippingCharges: foundOrder.pricing?.shippingCharges || 0,
        totalAmount: foundOrder.pricing?.totalAmount || 0,
        currency: foundOrder.pricing?.currency || 'INR'
      },
      items: (foundOrder.items || []).map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        tamilName: item.tamilName || '',
        weight: item.weight || '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal || (item.unitPrice * item.quantity)
      })),
      deliveryNotes: foundOrder.customer?.deliveryNotes || '',
      lastUpdated: foundOrder.updatedAt || foundOrder.createdAt
    };

    return res.json({
      success: true,
      order: trackingDetails
    });

  } catch (error) {
    console.error('❌ [Orders] Error during order tracking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order tracking details due to an internal server error.'
    });
  }
};

router.post('/track', trackingRateLimiter, handleTrackOrder);
router.get('/track', trackingRateLimiter, handleTrackOrder);

// ============================================================================
// Step 9: Admin Authentication & Order Management System
// ============================================================================

// In-memory active admin sessions & revoked token set
const adminSessions = new Map();
const revokedTokens = new Set();
const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours validity

const getAdminCredentials = () => {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    secretKey: process.env.ADMIN_SECRET || 'thaniyam-admin-secret-key-2026'
  };
};

export const createAdminToken = (username, role = 'Store Administrator') => {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ username, role, expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', getAdminCredentials().secretKey).update(payload).digest('hex');
  const token = `th_adm_${payload}.${signature}`;

  adminSessions.set(token, {
    username,
    role,
    createdAt: Date.now(),
    expiresAt
  });
  return token;
};

export const verifyAdminToken = (token) => {
  if (!token) return null;
  if (revokedTokens.has(token)) return null;

  const { secretKey } = getAdminCredentials();

  // If master secret is passed directly
  if (token === secretKey) {
    return { username: 'admin', role: 'Store Administrator' };
  }

  // Check in-memory session first
  const session = adminSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return null;
    }
    return { username: session.username, role: session.role };
  }

  // Stateless signature verification (supports serverless lambda cold starts)
  if (token.startsWith('th_adm_')) {
    const raw = token.slice('th_adm_'.length);
    const dotIndex = raw.lastIndexOf('.');
    if (dotIndex > 0) {
      const payloadB64 = raw.slice(0, dotIndex);
      const signature = raw.slice(dotIndex + 1);
      const expectedSignature = crypto.createHmac('sha256', secretKey).update(payloadB64).digest('hex');
      if (signature === expectedSignature) {
        try {
          const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
          if (data && data.expiresAt && Date.now() <= data.expiresAt) {
            return { username: data.username, role: data.role || 'Store Administrator' };
          }
        } catch {
          return null;
        }
      }
    }
  }

  return null;
};

// Admin Authorization Middleware
export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const xAdminKey = req.headers['x-admin-key'] || '';

  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (xAdminKey) {
    token = String(xAdminKey).trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Admin authorization required. Please log in with admin credentials.'
    });
  }

  const verified = verifyAdminToken(token);
  if (!verified) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin session. Please log in again.'
    });
  }

  req.admin = verified;
  next();
};

// 1. POST /api/orders/admin/login — Authenticate admin user
router.post('/admin/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    const creds = getAdminCredentials();

    if (
      !username ||
      !password ||
      username.trim().toLowerCase() !== creds.username.toLowerCase() ||
      password !== creds.password
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator username or password.'
      });
    }

    const token = createAdminToken(creds.username, 'Store Administrator');
    console.log(`🔐 [Admin Auth] Admin "${creds.username}" logged in successfully.`);

    return res.json({
      success: true,
      message: 'Admin login successful.',
      token,
      admin: {
        username: creds.username,
        role: 'Store Administrator'
      }
    });
  } catch (err) {
    console.error('❌ [Admin Auth] Login error:', err);
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
});

// 2. GET /api/orders/admin/verify — Verify active admin token
router.get('/admin/verify', requireAdminAuth, (req, res) => {
  return res.json({
    success: true,
    admin: req.admin
  });
});

// 3. POST /api/orders/admin/logout — Invalidate active admin session
router.post('/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : req.headers['x-admin-key'];
  if (token) {
    revokedTokens.add(token);
    if (adminSessions.has(token)) {
      adminSessions.delete(token);
    }
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. GET /api/orders/admin & GET /api/orders/admin/all — Retrieve all customer orders with filtering & pagination
const handleGetAdminOrders = async (req, res) => {
  try {
    const { search, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    let orders = [];
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        orders = await Order.find().sort({ createdAt: -1 }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Admin Orders] DB fetch error, falling back to memory store:', dbErr.message);
        orders = getAllOrdersFromFallback();
      }
    } else {
      orders = getAllOrdersFromFallback();
    }

    // Filter in-memory for consistent behavior across DB and fallback store
    let filtered = [...orders];

    // Filter: Search by Order ID, Customer Name, Mobile Number, Email
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const cleanQDigits = q.replace(/\D/g, '');
      filtered = filtered.filter((o) => {
        const idMatch = (o.orderId || '').toLowerCase().includes(q);
        const nameMatch = (o.customer?.fullName || '').toLowerCase().includes(q);
        const emailMatch = (o.customer?.email || '').toLowerCase().includes(q);
        const mobileMatch = cleanQDigits.length > 0 && 
          (o.customer?.mobile || '').replace(/\D/g, '').includes(cleanQDigits);
        return idMatch || nameMatch || emailMatch || mobileMatch;
      });
    }

    // Filter: Order Status
    if (status && status !== 'all' && status !== 'ALL') {
      const target = status.trim().toLowerCase();
      filtered = filtered.filter((o) => {
        const os = (o.orderStatus || 'Placed').toLowerCase();
        if (target === 'order placed' || target === 'placed') {
          return os === 'order placed' || os === 'placed';
        }
        if (target === 'shipped' || target === 'dispatched') {
          return os === 'shipped' || os === 'dispatched';
        }
        return os === target;
      });
    }

    // Filter: Date Range (startDate & endDate)
    if (startDate) {
      const startMs = new Date(startDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= startMs);
    }
    if (endDate) {
      const endMs = new Date(endDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter((o) => new Date(o.createdAt).getTime() <= endMs);
    }

    const totalOrders = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedOrders = filtered.slice(startIndex, startIndex + limitNum);

    // Compute live dashboard metrics summary across all active orders
    const summary = {
      total: orders.length,
      placed: orders.filter((o) => ['placed', 'order placed'].includes((o.orderStatus || '').toLowerCase())).length,
      confirmed: orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'confirmed').length,
      processing: orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'processing').length,
      shipped: orders.filter((o) => ['shipped', 'dispatched'].includes((o.orderStatus || '').toLowerCase())).length,
      outForDelivery: orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'out for delivery').length,
      delivered: orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'delivered').length,
      cancelled: orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'cancelled').length,
      totalRevenue: orders
        .filter((o) => (o.orderStatus || '').toLowerCase() !== 'cancelled')
        .reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0)
    };

    return res.json({
      success: true,
      summary,
      total: totalOrders,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalOrders / limitNum) || 1,
      orders: paginatedOrders
    });
  } catch (error) {
    console.error('❌ [Admin Orders] Error fetching customer orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders from database.'
    });
  }
};

router.get('/admin', requireAdminAuth, handleGetAdminOrders);
router.get('/admin/all', requireAdminAuth, handleGetAdminOrders);

// 5. GET /api/orders/admin/:orderId — Retrieve single order full admin view
router.get('/admin/:orderId', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    let foundOrder = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        foundOrder = await Order.findOne({
          orderId: { $regex: new RegExp(`^${orderId.trim()}$`, 'i') }
        }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Admin Orders] DB lookup error:', dbErr.message);
      }
    }

    if (!foundOrder) {
      foundOrder = getOrderFromFallback(orderId);
    }

    if (!foundOrder) {
      return res.status(404).json({
        success: false,
        message: `Order "${orderId}" was not found.`
      });
    }

    return res.json({
      success: true,
      order: foundOrder
    });
  } catch (error) {
    console.error('❌ [Admin Orders] Error retrieving order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.'
    });
  }
});

// Allowed Order Statuses for Step 9
const ALLOWED_ADMIN_STATUSES = [
  'Order Placed',
  'Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Dispatched',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

// 6. PATCH /api/orders/admin/:orderId/status — Update order status
router.patch('/admin/:orderId/status', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid order status string is required.'
      });
    }

    const trimmedStatus = status.trim();
    const matchedStatus = ALLOWED_ADMIN_STATUSES.find(
      (s) => s.toLowerCase() === trimmedStatus.toLowerCase()
    );

    if (!matchedStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${trimmedStatus}". Allowed statuses: ${ALLOWED_ADMIN_STATUSES.join(', ')}`
      });
    }

    const cleanOrderId = orderId.trim();
    let updatedOrder = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        updatedOrder = await Order.findOneAndUpdate(
          { orderId: { $regex: new RegExp(`^${cleanOrderId}$`, 'i') } },
          {
            $set: {
              orderStatus: matchedStatus,
              updatedAt: new Date()
            }
          },
          { new: true }
        ).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Admin Orders] DB status update error:', dbErr.message);
      }
    }

    // Always update in fallback store as well to ensure persistence in offline mode
    const fallbackUpdated = updateOrderStatusInFallback(cleanOrderId, matchedStatus);
    if (!updatedOrder) {
      updatedOrder = fallbackUpdated;
    }

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: `Order "${cleanOrderId}" could not be found to update.`
      });
    }

    // If order was cancelled, restore inventory stock
    if (matchedStatus.toLowerCase() === 'cancelled') {
      restoreStockForOrderItemsInStore(updatedOrder.items || []);
      if (isDbConnected) {
        for (const it of (updatedOrder.items || [])) {
          try {
            await Product.findOneAndUpdate(
              { id: it.productId },
              { $inc: { stock: it.quantity } }
            );
          } catch (err) {
            console.warn('⚠️ [Inventory] DB stock restore error:', err.message);
          }
        }
      }
      console.log(`🔄 [Inventory] Restored stock for cancelled order: ${cleanOrderId}`);
    }

    console.log(`📝 [Admin Orders] Status of ${cleanOrderId} updated to "${matchedStatus}" by admin ${req.admin.username}`);

    return res.json({
      success: true,
      message: `Order status successfully updated to "${matchedStatus}".`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('❌ [Admin Orders] Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status due to a server error.'
    });
  }
});

// GET /api/orders/:orderId — Retrieve an order by unique order ID (confirmation receipt)
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
