import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProductCard({ prod, onOpen, onAddToCart }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { lang, t } = useLanguage();

  const isOutOfStock =
    (typeof prod.stock === 'number' && prod.stock <= 0) || prod.inStock === false;
  const isLowStock = !isOutOfStock && typeof prod.stock === 'number' && prod.stock <= 5;
  const onSale = prod.originalPrice && prod.originalPrice > prod.price;
  const liked = isWishlisted(prod.id);
  const displayName = lang === 'ta' && prod.tamilName ? prod.tamilName : prod.name;
  const rating = Number(prod.rating) || 0;

  return (
    <article className={`product-card ${isOutOfStock ? 'card-out-of-stock' : ''}`}>
      <div className="product-badges">
        {isOutOfStock ? (
          <span className="pbadge pbadge-muted">{t('soldOut')}</span>
        ) : (
          <>
            {prod.badge && <span className="pbadge pbadge-green">{prod.badge.toUpperCase()}</span>}
            {isLowStock && <span className="pbadge pbadge-amber">Only {prod.stock} left!</span>}
            {onSale && <span className="pbadge pbadge-red">{t('sale')}</span>}
          </>
        )}
      </div>

      <button
        type="button"
        className={`wish-btn ${liked ? 'liked' : ''}`}
        aria-label={liked ? `Remove ${prod.name} from wishlist` : `Add ${prod.name} to wishlist`}
        aria-pressed={liked}
        onClick={() => toggleWishlist(prod.id)}
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
      </button>

      <button type="button" className="product-image-frame" onClick={() => onOpen(prod)} aria-label={`View ${prod.name}`}>
        <img src={prod.image} alt={prod.name} className="product-card-img" loading="lazy" />
      </button>

      <div className="product-body">
        <h3 className="product-title" onClick={() => onOpen(prod)}>
          {displayName}
        </h3>
        {prod.categoryName && <span className="product-cat-name">{prod.categoryName}</span>}
        {prod.weight && (
          <span className="product-qty">
            {t('quantity')}: {prod.weight}
          </span>
        )}

        <div className="product-rating-row">
          <span className="stars-row" aria-label={`Rated ${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={13}
                fill={n <= Math.round(rating) ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
          </span>
          <span className="rating-num">{rating ? rating.toFixed(1) : ''}</span>
          {prod.reviewsCount > 0 && <span className="rating-count">({prod.reviewsCount})</span>}
        </div>

        <div className="price-group">
          <span className="current-price">₹{prod.price}</span>
          {onSale && <span className="slashed-price">₹{prod.originalPrice}</span>}
        </div>

        <button
          type="button"
          className="btn-add-cart"
          disabled={isOutOfStock}
          aria-disabled={isOutOfStock}
          onClick={() => onAddToCart(prod)}
          aria-label={isOutOfStock ? `${prod.name} is sold out` : `Add ${prod.name} to cart`}
        >
          <ShoppingCart size={16} />
          <span>{isOutOfStock ? t('soldOut') : t('addToCart')}</span>
        </button>
      </div>
    </article>
  );
}
