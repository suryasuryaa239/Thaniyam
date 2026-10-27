import {
  isMySQLConnected,
  mysqlGetAllOrders,
  mysqlSaveOrder,
  mysqlUpdateOrderStatus
} from '../config/mysqlStore.js';

// In-memory / persistent development store for orders when MongoDB is in offline mode
const memoryOrders = new Map();

// Pre-seeded demo orders for reliable tracking verification & testing
const seedDemoOrders = () => {
  const demoOrder1 = {
    orderId: 'TT-ORD-20261026-1001',
    customer: {
      fullName: 'Arun Sundaram',
      mobile: '9876543210',
      email: 'arun.s@example.com',
      addressLine: '14, Cross Cut Road, Gandhipuram',
      city: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      deliveryNotes: 'Please deliver after 4 PM'
    },
    items: [
      {
        productId: 'prod-001',
        name: 'Kambu Ribbon Pakoda',
        tamilName: 'கம்பு ரிப்பன் பக்கோடா',
        weight: '250g',
        unitPrice: 135,
        quantity: 2,
        lineTotal: 270
      },
      {
        productId: 'prod-003',
        name: 'Thinai Murukku',
        tamilName: 'தினை முறுக்கு',
        weight: '200g',
        unitPrice: 125,
        quantity: 1,
        lineTotal: 125
      }
    ],
    pricing: {
      subtotal: 395,
      shippingCharges: 0,
      totalAmount: 395,
      currency: 'INR'
    },
    payment: {
      method: 'Pay on Delivery / Direct Confirmation',
      status: 'Confirmed'
    },
    orderStatus: 'Processing',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  };

  const demoOrder2 = {
    orderId: 'TT-ORD-20261025-2002',
    customer: {
      fullName: 'Meenakshi Raman',
      mobile: '9442012345',
      email: 'meenakshi.r@example.com',
      addressLine: '82, Heritage Street, Mylapore',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600004',
      deliveryNotes: 'Call upon arrival'
    },
    items: [
      {
        productId: 'prod-004',
        name: 'Karupatti Nei Halwa',
        tamilName: 'கருப்பட்டி நெய் அல்வா',
        weight: '250g',
        unitPrice: 195,
        quantity: 2,
        lineTotal: 390
      }
    ],
    pricing: {
      subtotal: 390,
      shippingCharges: 0,
      totalAmount: 390,
      currency: 'INR'
    },
    payment: {
      method: 'Pay on Delivery / Direct Confirmation',
      status: 'Confirmed'
    },
    orderStatus: 'Dispatched',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  };

  memoryOrders.set(demoOrder1.orderId, demoOrder1);
  memoryOrders.set(demoOrder2.orderId, demoOrder2);
};

seedDemoOrders();

export const syncOrdersFromMySQL = async () => {
  if (!isMySQLConnected()) return;
  try {
    const orders = await mysqlGetAllOrders();
    if (orders && orders.length > 0) {
      for (const o of orders) {
        memoryOrders.set(o.orderId, o);
      }
      console.log(`📋 [Store] Synced ${orders.length} orders from TiDB MySQL into cache.`);
    }
  } catch (err) {
    console.warn('⚠️ [MySQL] syncOrders warning:', err.message);
  }
};

export const saveOrderToFallback = (order) => {
  if (!order.createdAt) {
    order.createdAt = new Date().toISOString();
  }
  if (!order.updatedAt) {
    order.updatedAt = order.createdAt;
  }
  memoryOrders.set(order.orderId, order);
  if (isMySQLConnected()) {
    mysqlSaveOrder(order).catch((err) => console.warn('⚠️ [MySQL] saveOrder notice:', err.message));
  }
  return order;
};

export const getOrderFromFallback = (orderId) => {
  if (!orderId) return null;
  if (memoryOrders.has(orderId)) return memoryOrders.get(orderId);
  const target = orderId.trim().toUpperCase();
  for (const [key, val] of memoryOrders.entries()) {
    if (key.toUpperCase() === target) return val;
  }
  return null;
};

export const getAllOrdersFromFallback = () => {
  return Array.from(memoryOrders.values()).sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
};

export const updateOrderStatusInFallback = (orderId, newStatus) => {
  if (!orderId || !newStatus) return null;
  let targetOrder = null;
  let targetKey = null;

  if (memoryOrders.has(orderId)) {
    targetKey = orderId;
    targetOrder = memoryOrders.get(orderId);
  } else {
    const target = orderId.trim().toUpperCase();
    for (const [key, val] of memoryOrders.entries()) {
      if (key.toUpperCase() === target) {
        targetKey = key;
        targetOrder = val;
        break;
      }
    }
  }

  if (!targetOrder) return null;

  targetOrder.orderStatus = newStatus;
  targetOrder.updatedAt = new Date().toISOString();
  memoryOrders.set(targetKey, targetOrder);

  if (isMySQLConnected()) {
    mysqlUpdateOrderStatus(targetKey, newStatus, targetOrder.orderTimeline).catch((err) =>
      console.warn('⚠️ [MySQL] updateStatus notice:', err.message)
    );
  }

  return targetOrder;
};

