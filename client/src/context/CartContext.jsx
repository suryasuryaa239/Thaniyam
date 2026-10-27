import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'thaniyam_cart_items_v1';

// Safe localStorage loader with schema validation
const loadInitialCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Validate each item shape to avoid corrupted cache
    return parsed.filter(item => 
      item && 
      typeof item.id === 'string' && 
      typeof item.name === 'string' && 
      typeof item.price === 'number' && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    );
  } catch (err) {
    console.warn('⚠️ [Cart] Error reading cart from localStorage. Resetting cart to empty.', err);
    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadInitialCart);
  const [toast, setToast] = useState(null);

  // Sync cart to localStorage whenever cartItems updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.warn('⚠️ [Cart] Error saving cart to localStorage:', err);
    }
  }, [cartItems]);

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const closeToast = () => setToast(null);

  // Add product to cart (or increase quantity if existing)
  const addToCart = (product, quantityToAdd = 1) => {
    // If product is out of stock, do not add
    const productStock = typeof product.stock === 'number' ? product.stock : 50;
    if (productStock <= 0 || product.inStock === false) {
      showToast(
        'Out of Stock!',
        `"${product.name}" is currently sold out. Please check back soon.`
      );
      return;
    }

    const qty = Math.max(1, parseInt(quantityToAdd, 10) || 1);
    
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        // Item exists: check stock ceiling
        const currentQty = prevItems[existingIndex].quantity;
        const availableStock = typeof prevItems[existingIndex].stock === 'number'
          ? prevItems[existingIndex].stock
          : productStock;

        if (currentQty >= availableStock) {
          showToast(
            'Stock Limit Reached',
            `You already have all ${availableStock} available units of "${product.name}" in your basket.`
          );
          return prevItems;
        }

        const newQty = Math.min(availableStock, currentQty + qty);
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          stock: availableStock
        };
        showToast(
          'Cart Updated!',
          `${product.name} quantity updated to ${newQty} in your basket.`
        );
        return updated;
      } else {
        // New item: append to cart
        const initialQty = Math.min(productStock, qty);
        const newItem = {
          id: product.id,
          name: product.name,
          tamilName: product.tamilName || '',
          categoryName: product.categoryName || '',
          price: product.price,
          originalPrice: product.originalPrice || null,
          weight: product.weight || 'Standard Pack',
          image: product.image || '/images/hero-banner.jpg',
          quantity: initialQty,
          stock: productStock
        };
        showToast(
          'Added to Cart!',
          `${initialQty}x ${product.name} (${newItem.weight}) added to your basket.`
        );
        return [...prevItems, newItem];
      }
    });
  };

  // Update item quantity (prevents zero, negative, or exceeding available stock)
  const updateQuantity = (productId, newQuantity, availableStock = 50) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const maxAllowed = typeof item.stock === 'number' ? item.stock : availableStock;
          const cappedQty = Math.max(1, Math.min(maxAllowed, parseInt(newQuantity, 10) || 1));
          if (newQuantity > maxAllowed) {
            showToast('Stock Limit', `Only ${maxAllowed} units available in stock.`);
          }
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    const itemToRemove = cartItems.find((i) => i.id === productId);
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    if (itemToRemove) {
      showToast(
        'Item Removed',
        `${itemToRemove.name} was removed from your cart.`
      );
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    showToast('Cart Cleared', 'All items have been removed from your shopping basket.');
  };

  // Derived calculations
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toast,
        showToast,
        closeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
