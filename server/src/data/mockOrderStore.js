// In-memory / persistent development store for orders when MongoDB is in offline mode
import fs from 'fs';
import path from 'path';

const memoryOrders = new Map();

export const saveOrderToFallback = (order) => {
  memoryOrders.set(order.orderId, order);
  return order;
};

export const getOrderFromFallback = (orderId) => {
  return memoryOrders.get(orderId) || null;
};
