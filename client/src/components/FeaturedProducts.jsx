import React from 'react';
import { FEATURED_PRODUCTS } from '../data/sampleData';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';

export default function FeaturedProducts({
  onQuickView,
  onViewProduct,
  onAddToCart,
  searchQuery,
  products: productsProp,
}) {
  const { t } = useLanguage();
  const activeCatalog = (productsProp || FEATURED_PRODUCTS).filter((p) => p.isActive !== false);

  const q = (searchQuery || '').toLowerCase();
  const filteredProducts = activeCatalog.filter((product) => {
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      (product.tamilName && product.tamilName.toLowerCase().includes(q)) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(q))
    );
  });

  const openProduct = (prod) => (onViewProduct ? onViewProduct(prod.id) : onQuickView(prod));

  return (
    <section id="featured-products" className="products-section">
      <div className="section-header">
        <h2 className="section-title">{t('featuredTitle')}</h2>
        <p className="section-subtitle">{t('featuredSub')}</p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products-found">
          <p>
            No products found matching "<strong>{searchQuery}</strong>".
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} prod={prod} onOpen={openProduct} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}
