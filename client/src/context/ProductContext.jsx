import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ALL_PRODUCTS as FALLBACK_PRODUCTS } from '../data/productsCatalog';
import { apiUrl } from '../config/api';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(apiUrl('/api/products'));
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('⚠️ [ProductContext] API unavailable, using local catalog fallback:', err.message);
      setError(err.message);
      // Fallback is already initialized in state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductById = useCallback((id) => {
    const found = products.find((p) => p.id === id);
    if (!found) return null;
    return {
      ...found,
      images: Array.isArray(found.images) && found.images.length > 0
        ? found.images
        : [found.image || '/images/cat-snacks.jpg', '/images/hero-banner.jpg', '/images/our-story.jpg']
    };
  }, [products]);

  const getRelatedProducts = useCallback((currentId, categoryId, limit = 4) => {
    return products
      .filter((p) => p.category === categoryId && p.id !== currentId && (p.isActive !== false))
      .slice(0, limit);
  }, [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        refreshProducts: fetchProducts,
        getProductById,
        getRelatedProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
