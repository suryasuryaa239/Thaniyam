import React, { useState } from 'react';
import { 
  ChevronRight, Trash2, ShoppingBag, ArrowRight, ArrowLeft, 
  ShieldCheck, AlertTriangle, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage({ 
  onNavigateHome, 
  onNavigateShop, 
  onViewProduct, 
  onNavigateCheckout 
}) {
  const { cartItems, totalItems, cartSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="cart-page">
      <div className="cart-page-container">
        {/* Breadcrumbs: Home → Shop → Shopping Cart */}
        <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
          <button className="breadcrumb-link" onClick={onNavigateHome}>Home</button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <button className="breadcrumb-link" onClick={() => onNavigateShop('all')}>Shop</button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span className="breadcrumb-current">Shopping Cart ({totalItems})</span>
        </nav>

        <header className="cart-header">
          <h1 className="cart-main-heading">Your Shopping Basket</h1>
          <p className="cart-subheading">
            Review your traditional food selections before proceeding to checkout.
          </p>
        </header>

        {/* 1. Empty Cart State */}
        {cartItems.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-icon-wrap">
              <ShoppingBag size={48} className="empty-cart-icon" />
            </div>
            <h2 className="empty-cart-title">Your shopping basket is empty</h2>
            <p className="empty-cart-desc">
              Looks like you haven't added any traditional treats or native millets yet. 
              Explore our handcrafted delicacies and fill your pantry with authentic village goodness!
            </p>
            <button className="btn-primary" onClick={() => onNavigateShop('all')}>
              <span>Explore Traditional Pantry</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* 2. Cart with Items (Responsive 2-column layout) */
          <div className="cart-layout-grid">
            {/* Left Column: Cart Items List */}
            <div className="cart-items-column">
              <div className="cart-items-card">
                <div className="cart-items-header">
                  <span className="col-header-item">Product</span>
                  <span className="col-header-qty">Quantity</span>
                  <span className="col-header-total">Subtotal</span>
                  <span className="col-header-action"></span>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const lineSubtotal = item.price * item.quantity;

                    return (
                      <div key={item.id} className="cart-item-row">
                        {/* Item Details (Thumbnail + Titles) */}
                        <div className="cart-item-product">
                          <div 
                            className="cart-item-thumb-frame"
                            onClick={() => onViewProduct(item.id)}
                            title={`View details for ${item.name}`}
                          >
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="cart-thumb-img" 
                            />
                          </div>

                          <div className="cart-item-info">
                            <span className="cart-item-category">{item.categoryName}</span>
                            <h3 
                              className="cart-item-title"
                              onClick={() => onViewProduct(item.id)}
                            >
                              {item.name}
                            </h3>
                            {item.tamilName && (
                              <span className="cart-item-tamil">{item.tamilName}</span>
                            )}
                            <div className="cart-item-price-meta">
                              <span className="cart-item-unit-price">₹{item.price}</span>
                              <span className="cart-item-weight">/ {item.weight}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="cart-item-quantity">
                          {(() => {
                            const maxStock = typeof item.stock === 'number' ? item.stock : 20;
                            const isAtMax = item.quantity >= maxStock;

                            return (
                              <div className="cart-qty-wrapper">
                                <div className="cart-qty-box">
                                  <button
                                    className="cart-qty-btn"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1, maxStock)}
                                    disabled={item.quantity <= 1}
                                    aria-label={`Decrease quantity of ${item.name}`}
                                  >
                                    -
                                  </button>
                                  <span className="cart-qty-val" aria-live="polite">
                                    {item.quantity}
                                  </span>
                                  <button
                                    className="cart-qty-btn"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1, maxStock)}
                                    disabled={isAtMax}
                                    aria-label={`Increase quantity of ${item.name}`}
                                    title={isAtMax ? `Max available stock (${maxStock}) reached` : 'Add one more'}
                                  >
                                    +
                                  </button>
                                </div>
                                {isAtMax && maxStock > 0 && (
                                  <span className="cart-stock-cap-hint" style={{ fontSize: '0.72rem', color: '#b45309', display: 'block', marginTop: '2px' }}>
                                    Max stock ({maxStock})
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Line Subtotal */}
                        <div className="cart-item-subtotal">
                          <span className="subtotal-amount">₹{lineSubtotal}</span>
                        </div>

                        {/* Remove Action */}
                        <div className="cart-item-remove">
                          <button
                            className="btn-remove-item"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Action Footer */}
                <div className="cart-items-footer">
                  <button 
                    className="btn-continue-shopping"
                    onClick={() => onNavigateShop('all')}
                  >
                    <ArrowLeft size={16} />
                    <span>Continue Shopping</span>
                  </button>

                  <button 
                    className="btn-clear-cart"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    <Trash2 size={15} />
                    <span>Clear Cart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h2 className="summary-title">Order Summary</h2>

                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span className="summary-label">Selected Items</span>
                    <span className="summary-value">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Items Subtotal</span>
                    <span className="summary-value">₹{cartSubtotal}</span>
                  </div>

                  <div className="summary-notice-box">
                    <p className="notice-text">
                      <strong>Delivery Charges:</strong> Final shipping charges and standard delivery timelines will be calculated and confirmed during checkout based on your delivery address.
                    </p>
                  </div>

                  <div className="summary-row total-row">
                    <span className="total-label">Estimated Total</span>
                    <span className="total-value">₹{cartSubtotal}</span>
                  </div>
                </div>

                {/* Proceed to Checkout Button */}
                <button 
                  className="btn-primary btn-checkout-proceed"
                  onClick={onNavigateCheckout}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>

                {/* Trust Badges */}
                <div className="summary-trust-strip">
                  <div className="summary-trust-item">
                    <ShieldCheck size={18} className="trust-icon" />
                    <div>
                      <strong>Zero Additives</strong>
                      <p>Traditional pure ingredients</p>
                    </div>
                  </div>
                  <div className="summary-trust-item">
                    <Sparkles size={18} className="trust-icon" />
                    <div>
                      <strong>Fresh Small-Batch</strong>
                      <p>Handcrafted village recipes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="modal-backdrop" onClick={() => setShowClearConfirm(false)}>
            <div className="modal-container confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon-wrap">
                <AlertTriangle size={36} color="#d97706" />
              </div>
              <h3 className="confirm-title">Clear Shopping Basket?</h3>
              <p className="confirm-desc">
                Are you sure you want to remove all {totalItems} items from your cart? 
                This action cannot be undone.
              </p>
              <div className="confirm-actions-row">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary btn-danger-confirm" 
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                >
                  Yes, Clear Basket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
