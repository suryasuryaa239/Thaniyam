import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Check } from 'lucide-react';

export default function ProductQuickViewModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close product quick view">
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Product Image */}
          <div className="modal-image-col">
            <div className="modal-image-frame">
              <img src={product.image} alt={product.name} className="modal-img" />
              {product.badge && <span className="product-badge modal-badge">{product.badge}</span>}
            </div>
          </div>

          {/* Product Details */}
          <div className="modal-details-col">
            <span className="modal-category">{product.categoryName} • {product.weight}</span>
            <h2 id="modal-title" className="modal-title">{product.name}</h2>
            <p className="modal-tamil-name">{product.tamilName}</p>

            {/* Ratings */}
            <div className="modal-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#d97706" color="#d97706" />
                ))}
              </div>
              <span className="rating-value">{product.rating}</span>
              <span className="reviews-count">({product.reviewsCount} verified reviews)</span>
            </div>

            {/* Price Row */}
            <div className="modal-price-row">
              <span className="modal-price">₹{product.price}</span>
              {product.originalPrice && (
                <span className="modal-original-price">₹{product.originalPrice}</span>
              )}
              <span className="modal-tax-note">Inclusive of all taxes</span>
            </div>

            {/* Description */}
            <p className="modal-description">{product.description}</p>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="modal-ingredients-section">
                <strong className="ingredients-heading">Traditional Ingredients:</strong>
                <div className="ingredients-pills">
                  {product.ingredients.map((ing, idx) => (
                    <span key={idx} className="ingredient-pill">{ing}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Trust check */}
            <div className="modal-guarantee">
              <ShieldCheck size={16} className="guarantee-icon" />
              <span>Small-batch prepared without synthetic food preservatives.</span>
            </div>

            {/* Live Stock Pill */}
            {(() => {
              const productStock = typeof product.stock === 'number' ? product.stock : 25;
              const isOutOfStock = productStock <= 0 || product.inStock === false;
              const isLowStock = !isOutOfStock && productStock <= 5;

              return (
                <>
                  <div className={`stock-status-pill ${isOutOfStock ? 'stock-pill-out' : isLowStock ? 'stock-pill-low' : 'stock-pill-ok'}`}>
                    <span className={`stock-indicator-dot ${isOutOfStock ? 'dot-red' : isLowStock ? 'dot-amber' : 'dot-green'}`}></span>
                    <strong>Status:</strong>
                    {isOutOfStock ? (
                      <span className="stock-label-out">Out of Stock (கையிருப்பு இல்லை)</span>
                    ) : isLowStock ? (
                      <span className="stock-label-low">Only {productStock} left in stock!</span>
                    ) : (
                      <span>In Stock ({productStock} units)</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="modal-actions-row">
                    <div className="quantity-control">
                      <button 
                        className="qty-btn" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isOutOfStock || quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-value">{isOutOfStock ? 0 : quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => setQuantity(Math.min(Math.min(productStock, 20), quantity + 1))}
                        disabled={isOutOfStock || quantity >= Math.min(productStock, 20)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {isOutOfStock ? (
                      <button 
                        className="btn-primary modal-add-btn btn-soldout"
                        disabled
                        aria-disabled="true"
                      >
                        <span>Sold Out</span>
                      </button>
                    ) : (
                      <button 
                        className={`btn-primary modal-add-btn ${added ? 'btn-success' : ''}`}
                        onClick={handleAdd}
                      >
                        {added ? (
                          <>
                            <Check size={18} />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            <span>Add to Cart • ₹{product.price * quantity}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
