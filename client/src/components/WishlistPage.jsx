import React from 'react';
import { useProducts } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';

export default function WishlistPage({ onViewProduct, onAddToCart, onNavigateShop }) {
  const { products } = useProducts();
  const { wishlistIds } = useWishlist();
  const { t } = useLanguage();

  const saved = products.filter((p) => wishlistIds.includes(p.id) && p.isActive !== false);

  return (
    <section className="products-section wishlist-page">
      <div className="section-header">
        <h1 className="section-title">{t('wishlistTitle')}</h1>
      </div>

      {saved.length === 0 ? (
        <div className="no-products-found">
          <p>{t('wishlistEmpty')}</p>
          <button className="btn-primary" onClick={() => onNavigateShop()}>
            {t('continueShopping')}
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {saved.map((prod) => (
            <ProductCard
              key={prod.id}
              prod={prod}
              onOpen={(p) => onViewProduct(p.id)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
