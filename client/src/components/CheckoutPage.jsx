import React, { useState } from 'react';
import { 
  ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, 
  AlertCircle, Lock, Truck, Phone, MapPin, Sparkles, Loader2 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const INDIAN_STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Puducherry', 'Goa', 'Gujarat', 'Delhi', 'Other'
];

export default function CheckoutPage({ 
  onNavigateHome, 
  onNavigateShop, 
  onNavigateCart, 
  onOrderSuccess 
}) {
  const { cartItems, totalItems, cartSubtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    addressLine: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    deliveryNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // If cart is empty, redirect or show message
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-page-container">
          <div className="empty-cart-card">
            <div className="empty-cart-icon-wrap">
              <AlertCircle size={44} color="#d97706" />
            </div>
            <h2 className="empty-cart-title">Your shopping basket is empty</h2>
            <p className="empty-cart-desc">
              You must have at least one product in your cart to proceed with checkout.
            </p>
            <button className="btn-primary" onClick={() => onNavigateShop('all')}>
              <span>Browse Products</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validateField = (name, value) => {
    let error = '';
    const trimmed = (value || '').trim();

    switch (name) {
      case 'fullName':
        if (!trimmed) error = 'Full name is required';
        else if (trimmed.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'mobile':
        if (!trimmed) error = 'Mobile number is required';
        else if (!/^[6-9]\d{9}$/.test(trimmed)) error = 'Enter a valid 10-digit Indian mobile number';
        break;
      case 'email':
        if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'addressLine':
        if (!trimmed) error = 'Street address is required';
        else if (trimmed.length < 5) error = 'Address must be at least 5 characters';
        break;
      case 'city':
        if (!trimmed) error = 'Town / City is required';
        break;
      case 'state':
        if (!trimmed) error = 'State is required';
        break;
      case 'pincode':
        if (!trimmed) error = 'PIN code is required';
        else if (!/^[1-9]\d{5}$/.test(trimmed)) error = 'Enter a valid 6-digit PIN code';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time error clearing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    ['fullName', 'mobile', 'addressLine', 'city', 'state', 'pincode'].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    if (formData.email) {
      const emailErr = validateField('email', formData.email);
      if (emailErr) newErrors.email = emailErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    if (!validateAll()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        customer: {
          fullName: formData.fullName.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim(),
          addressLine: formData.addressLine.trim(),
          city: formData.city.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          deliveryNotes: formData.deliveryNotes.trim()
        },
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server returned error (${res.status})`);
      }

      // Order created successfully on backend!
      clearCart(); // Safe to clear cart only after server confirms
      onOrderSuccess(data.order);

    } catch (err) {
      console.error('Order placement error:', err);
      setServerError(err.message || 'Unable to place order. Please check your details and try again.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
          <button className="breadcrumb-link" onClick={onNavigateHome}>Home</button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <button className="breadcrumb-link" onClick={() => onNavigateShop('all')}>Shop</button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <button className="breadcrumb-link" onClick={onNavigateCart}>Basket ({totalItems})</button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span className="breadcrumb-current">Delivery Checkout</span>
        </nav>

        <header className="checkout-header">
          <h1 className="checkout-main-heading">Delivery & Order Review</h1>
          <p className="checkout-subheading">
            Enter your delivery details to place your traditional treats order.
          </p>
        </header>

        {/* Server-level error notice */}
        {serverError && (
          <div className="checkout-alert-error" role="alert">
            <AlertCircle size={20} className="alert-icon" />
            <div>
              <strong>Order Placement Failed</strong>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="checkout-layout-grid">
            {/* Left Column: Delivery Details Form */}
            <div className="checkout-form-column">
              <div className="checkout-form-card">
                <div className="form-section-title-wrap">
                  <span className="form-step-number">1</span>
                  <div>
                    <h2 className="form-section-title">Customer Contact Details</h2>
                    <p className="form-section-subtitle">We will use this to confirm and track your shipment.</p>
                  </div>
                </div>

                <div className="form-row-grid">
                  {/* Full Name */}
                  <div className="form-group col-span-2">
                    <label htmlFor="fullName" className="form-label">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                      placeholder="e.g. Senthil Kumar"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="name"
                    />
                    {errors.fullName && <span className="field-error-msg">{errors.fullName}</span>}
                  </div>

                  {/* Mobile Number */}
                  <div className="form-group">
                    <label htmlFor="mobile" className="form-label">
                      Mobile Number (10 digits) <span className="req">*</span>
                    </label>
                    <div className="phone-input-wrap">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        maxLength="10"
                        className={`form-input phone-input ${errors.mobile ? 'input-error' : ''}`}
                        placeholder="9876543210"
                        value={formData.mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.mobile && <span className="field-error-msg">{errors.mobile}</span>}
                  </div>

                  {/* Email (Optional) */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="opt">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="senthil@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="email"
                    />
                    {errors.email && <span className="field-error-msg">{errors.email}</span>}
                  </div>
                </div>

                {/* Section 2: Delivery Address */}
                <div className="form-section-title-wrap" style={{ marginTop: 32 }}>
                  <span className="form-step-number">2</span>
                  <div>
                    <h2 className="form-section-title">Delivery Address in India</h2>
                    <p className="form-section-subtitle">Where should we deliver your handcrafted treats?</p>
                  </div>
                </div>

                <div className="form-row-grid">
                  {/* Street Address */}
                  <div className="form-group col-span-2">
                    <label htmlFor="addressLine" className="form-label">
                      Door No., Building, Street Address <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="addressLine"
                      name="addressLine"
                      className={`form-input ${errors.addressLine ? 'input-error' : ''}`}
                      placeholder="e.g. 42, North Mada Street, Mylapore"
                      value={formData.addressLine}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="street-address"
                    />
                    {errors.addressLine && <span className="field-error-msg">{errors.addressLine}</span>}
                  </div>

                  {/* Town / City */}
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      Town / City <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className={`form-input ${errors.city ? 'input-error' : ''}`}
                      placeholder="e.g. Coimbatore"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="address-level2"
                    />
                    {errors.city && <span className="field-error-msg">{errors.city}</span>}
                  </div>

                  {/* District */}
                  <div className="form-group">
                    <label htmlFor="district" className="form-label">
                      District <span className="opt">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      className="form-input"
                      placeholder="e.g. Coimbatore District"
                      value={formData.district}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* State */}
                  <div className="form-group">
                    <label htmlFor="state" className="form-label">
                      State <span className="req">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      className={`form-select ${errors.state ? 'input-error' : ''}`}
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      autoComplete="address-level1"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {errors.state && <span className="field-error-msg">{errors.state}</span>}
                  </div>

                  {/* PIN Code */}
                  <div className="form-group">
                    <label htmlFor="pincode" className="form-label">
                      6-Digit PIN Code <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      maxLength="6"
                      className={`form-input ${errors.pincode ? 'input-error' : ''}`}
                      placeholder="641001"
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="postal-code"
                    />
                    {errors.pincode && <span className="field-error-msg">{errors.pincode}</span>}
                  </div>

                  {/* Delivery Instructions */}
                  <div className="form-group col-span-2">
                    <label htmlFor="deliveryNotes" className="form-label">
                      Delivery Instructions / Landmark <span className="opt">(Optional)</span>
                    </label>
                    <textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      rows="2"
                      className="form-textarea"
                      placeholder="e.g. Near Vinayagar Temple, please call before delivery"
                      value={formData.deliveryNotes}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-footer-action">
                  <button 
                    type="button" 
                    className="btn-back-to-cart"
                    onClick={onNavigateCart}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft size={16} />
                    <span>Return to Basket</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review & Submit */}
            <div className="checkout-review-column">
              <div className="checkout-review-card">
                <h2 className="review-title">Review Order Items ({totalItems})</h2>

                {/* Items snapshot list */}
                <div className="review-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="review-item-row">
                      <div className="review-thumb">
                        <img src={item.image} alt={item.name} />
                        <span className="review-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="review-info">
                        <h4 className="review-item-name">{item.name}</h4>
                        <span className="review-item-weight">{item.weight}</span>
                        <div className="review-price-calc">
                          <span>{item.quantity} × ₹{item.price}</span>
                        </div>
                      </div>
                      <span className="review-line-total">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Totals Breakdown */}
                <div className="review-breakdown">
                  <div className="review-row">
                    <span>Items Subtotal</span>
                    <span className="bold">₹{cartSubtotal}</span>
                  </div>
                  <div className="review-row">
                    <span>Delivery Charges</span>
                    <span className="free-tag">To be confirmed at dispatch</span>
                  </div>
                  <div className="review-row total-highlight">
                    <span>Total Amount Payable</span>
                    <span className="total-price">₹{cartSubtotal}</span>
                  </div>
                </div>

                {/* Payment Scope Notice */}
                <div className="payment-notice-card">
                  <div className="payment-notice-header">
                    <Lock size={16} color="#1b4332" />
                    <strong>Payment Arrangements</strong>
                  </div>
                  <p className="payment-notice-text">
                    This MVP order is placed under <strong>Pay on Delivery / Direct Confirmation</strong>. 
                    No payment gateway or card entry is required right now. 
                    Our team will confirm your order and delivery dispatch directly with you.
                  </p>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  className="btn-primary btn-submit-order"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      <span>Placing Your Traditional Order...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Confirm & Place Order • ₹{cartSubtotal}</span>
                    </>
                  )}
                </button>

                <p className="submit-disclaimer">
                  By placing this order, you confirm your delivery details are accurate.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
