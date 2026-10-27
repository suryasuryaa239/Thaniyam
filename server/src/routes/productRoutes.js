import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import {
  getAllProductsFromStore,
  getProductByIdFromStore,
  createProductInStore,
  updateProductInStore,
  adjustProductStockInStore,
  setProductStockInStore,
  deactivateOrDeleteProductInStore
} from '../data/mockProductStore.js';
import { getAllOrdersFromFallback } from '../data/mockOrderStore.js';
import { requireAdminAuth } from './orderRoutes.js';

const router = express.Router();

// Helper to determine if a product has been ordered in past customer orders
const checkProductHasOrders = async (productId) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  // 1. Check MongoDB if active
  if (isDbConnected) {
    try {
      const match = await Order.findOne({ 'items.productId': productId }).lean();
      if (match) return true;
    } catch (err) {
      console.warn('⚠️ [Product Safety] Error checking order history in DB:', err.message);
    }
  }

  // 2. Check memory store fallback
  const fallbackOrders = getAllOrdersFromFallback();
  return fallbackOrders.some((order) =>
    (order.items || []).some((item) => (item.productId || item.id) === productId)
  );
};

// ============================================================================
// 1. PUBLIC ROUTES (For Customer Storefront: /shop, /product, Hero, Cart)
// ============================================================================

// GET /api/products — Retrieve active products for customer storefront
router.get('/', async (req, res) => {
  try {
    const { category, search, stockStatus } = req.query;
    let products = [];
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const query = { isActive: true };
        if (category && category !== 'all' && category !== 'ALL') {
          query.category = new RegExp(`^${category}$`, 'i');
        }
        if (search && search.trim()) {
          const q = search.trim();
          query.$or = [
            { name: { $regex: q, $options: 'i' } },
            { tamilName: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ];
        }
        if (stockStatus === 'in-stock') {
          query.stock = { $gt: 5 };
        } else if (stockStatus === 'low-stock') {
          query.stock = { $gt: 0, $lte: 5 };
        } else if (stockStatus === 'out-of-stock') {
          query.stock = { $lte: 0 };
        }

        products = await Product.find(query).sort({ createdAt: 1 }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Products API] DB query error, using memory store:', dbErr.message);
        products = getAllProductsFromStore({
          includeInactive: false,
          category,
          search,
          stockStatus
        });
      }
    } else {
      products = getAllProductsFromStore({
        includeInactive: false,
        category,
        search,
        stockStatus
      });
    }

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('❌ [Products API] Error retrieving products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products catalogue.'
    });
  }
});

// GET /api/products/:id — Single product details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        product = await Product.findOne({ id }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Products API] DB lookup error:', dbErr.message);
      }
    }

    if (!product) {
      product = getProductByIdFromStore(id);
    }

    if (!product || (!product.isActive && !req.headers.authorization)) {
      return res.status(404).json({
        success: false,
        message: `Product with ID "${id}" was not found.`
      });
    }

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ [Products API] Error retrieving product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product details.'
    });
  }
});

// ============================================================================
// 2. ADMIN ROUTES (Inventory Management: Add, Edit, Delete, Stock Adjustment)
// ============================================================================

// GET /api/products/admin/all — Retrieve all products including inactive & inventory stats
router.get('/admin/all', requireAdminAuth, async (req, res) => {
  try {
    const { category, search, stockStatus } = req.query;
    let products = [];
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        products = await Product.find().sort({ createdAt: 1 }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Admin Products] DB query error, using memory store:', dbErr.message);
        products = getAllProductsFromStore({ includeInactive: true });
      }
    } else {
      products = getAllProductsFromStore({ includeInactive: true });
    }

    // Compute inventory stats across all products
    const inStockList = products.filter((p) => p.stock > 5);
    const lowStockList = products.filter((p) => p.stock > 0 && p.stock <= 5);
    const outOfStockList = products.filter((p) => p.stock <= 0);

    const stats = {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive !== false).length,
      inactiveProducts: products.filter((p) => p.isActive === false).length,
      inStockCount: inStockList.length,
      lowStockCount: lowStockList.length,
      outOfStockCount: outOfStockList.length,
      totalStockUnits: products.reduce((acc, p) => acc + (p.stock || 0), 0),
      totalInventoryValue: products.reduce(
        (acc, p) => acc + ((p.price || 0) * (p.stock || 0)),
        0
      )
    };

    // Filter list for display
    let filtered = [...products];

    if (category && category !== 'all' && category !== 'ALL') {
      filtered = filtered.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.tamilName || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q)
      );
    }

    if (stockStatus) {
      if (stockStatus === 'in-stock') {
        filtered = filtered.filter((p) => p.stock > 5);
      } else if (stockStatus === 'low-stock') {
        filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 5);
      } else if (stockStatus === 'out-of-stock') {
        filtered = filtered.filter((p) => p.stock <= 0);
      } else if (stockStatus === 'inactive') {
        filtered = filtered.filter((p) => p.isActive === false);
      }
    }

    return res.json({
      success: true,
      stats,
      count: filtered.length,
      products: filtered
    });
  } catch (error) {
    console.error('❌ [Admin Products] Error retrieving products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory data.'
    });
  }
});

// POST /api/products — Add a new product to catalogue & inventory
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const {
      name,
      tamilName,
      category,
      categoryName,
      price,
      originalPrice,
      weight,
      stock,
      image,
      images,
      badge,
      description,
      ingredients
    } = req.body || {};

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required (minimum 2 characters).'
      });
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number greater than 0.'
      });
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Available stock quantity must be a non-negative integer (0 or greater).'
      });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid category.'
      });
    }

    // 2. Prepare payload
    const productPayload = {
      name: name.trim(),
      tamilName: tamilName ? tamilName.trim() : '',
      category: category.trim(),
      categoryName: categoryName ? categoryName.trim() : category.trim(),
      price: numPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      weight: weight ? weight.trim() : '250g',
      stock: numStock,
      inStock: numStock > 0,
      isActive: true,
      image: image ? image.trim() : '/images/cat-snacks.jpg',
      images: Array.isArray(images) && images.length > 0 ? images : [image || '/images/cat-snacks.jpg'],
      badge: badge ? badge.trim() : '',
      description: description ? description.trim() : '',
      ingredients: Array.isArray(ingredients)
        ? ingredients
        : (typeof ingredients === 'string'
            ? ingredients.split(',').map((s) => s.trim()).filter(Boolean)
            : [])
    };

    // 3. Save to store
    let createdProduct = createProductInStore(productPayload);

    // Also persist in MongoDB if available
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      try {
        await Product.create(createdProduct);
      } catch (dbErr) {
        console.warn('⚠️ [Admin Products] DB product save error:', dbErr.message);
      }
    }

    console.log(`📦 [Products] New product created: ${createdProduct.id} — "${createdProduct.name}" (Stock: ${createdProduct.stock})`);

    return res.status(201).json({
      success: true,
      message: `Product "${createdProduct.name}" created successfully with initial stock of ${createdProduct.stock} units.`,
      product: createdProduct
    });
  } catch (error) {
    console.error('❌ [Admin Products] Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product due to an unexpected server error.'
    });
  }
});

// PUT /api/products/:id — Edit existing product details & update price and stock
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    // 1. Validation if fields are provided
    if (updates.name !== undefined && (typeof updates.name !== 'string' || updates.name.trim().length < 2)) {
      return res.status(400).json({
        success: false,
        message: 'Product name must be at least 2 characters.'
      });
    }

    if (updates.price !== undefined) {
      const numPrice = parseFloat(updates.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number.'
        });
      }
    }

    if (updates.stock !== undefined) {
      const numStock = parseInt(updates.stock, 10);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock quantity cannot be negative.'
        });
      }
    }

    // 2. Update in store
    const updatedProduct = updateProductInStore(id, updates);
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID "${id}" was not found.`
      });
    }

    // 3. Update in MongoDB if connected
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      try {
        await Product.findOneAndUpdate({ id }, { $set: updatedProduct }, { new: true });
      } catch (dbErr) {
        console.warn('⚠️ [Admin Products] DB product update error:', dbErr.message);
      }
    }

    console.log(`✏️ [Products] Product updated: ${id} — "${updatedProduct.name}" (Stock: ${updatedProduct.stock})`);

    return res.json({
      success: true,
      message: `Product "${updatedProduct.name}" updated successfully.`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('❌ [Admin Products] Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product details.'
    });
  }
});

// PATCH /api/products/:id/stock — Quick adjust or set stock quantity
router.patch('/:id/stock', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { delta, targetStock } = req.body || {};

    let updatedProduct = null;

    if (targetStock !== undefined) {
      const num = parseInt(targetStock, 10);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({
          success: false,
          message: 'Target stock must be a non-negative integer (0 or greater).'
        });
      }
      updatedProduct = setProductStockInStore(id, num);
    } else if (delta !== undefined) {
      const numDelta = parseInt(delta, 10);
      if (isNaN(numDelta)) {
        return res.status(400).json({
          success: false,
          message: 'Delta must be an integer (e.g. +5, -2).'
        });
      }
      updatedProduct = adjustProductStockInStore(id, numDelta);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either "delta" or "targetStock" must be provided.'
      });
    }

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID "${id}" was not found.`
      });
    }

    // Update in MongoDB
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      try {
        await Product.findOneAndUpdate(
          { id },
          { $set: { stock: updatedProduct.stock, inStock: updatedProduct.stock > 0 } }
        );
      } catch (dbErr) {
        console.warn('⚠️ [Admin Products] DB stock update error:', dbErr.message);
      }
    }

    console.log(`📊 [Products] Stock updated for ${id}: ${updatedProduct.stock} units`);

    return res.json({
      success: true,
      message: `Stock for "${updatedProduct.name}" set to ${updatedProduct.stock} units (${updatedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}).`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('❌ [Admin Products] Error updating stock:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to adjust stock quantity.'
    });
  }
});

// DELETE /api/products/:id — Deactivate or safely delete product without breaking existing orders
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if this product has existing customer order history
    const hasOrderHistory = await checkProductHasOrders(id);

    // If product has existing customer orders, safely DEACTIVATE it so existing orders remain 100% intact!
    const result = deactivateOrDeleteProductInStore(id, hasOrderHistory);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Product "${id}" was not found.`
      });
    }

    // Update in MongoDB
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      try {
        if (hasOrderHistory) {
          await Product.findOneAndUpdate({ id }, { $set: { isActive: false } });
        } else {
          await Product.findOneAndDelete({ id });
        }
      } catch (dbErr) {
        console.warn('⚠️ [Admin Products] DB delete/deactivate error:', dbErr.message);
      }
    }

    console.log(`🗑️ [Products] Delete/Deactivate executed for ${id}: action=${result.action}`);

    return res.json({
      success: true,
      action: result.action, // 'deactivated' | 'deleted'
      message: result.message,
      product: result.product
    });
  } catch (error) {
    console.error('❌ [Admin Products] Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove or deactivate product.'
    });
  }
});

export default router;
