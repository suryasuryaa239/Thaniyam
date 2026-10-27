import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Package, Truck, CheckCircle2, Clock, AlertCircle,
  Phone, ArrowLeft, ShoppingBag, Copy, Check, Printer,
  RefreshCw, ShieldCheck, ChevronRight, MapPin, Calendar,
  XCircle, Sparkles
} from 'lucide-react';
import { ALL_PRODUCTS } from '../data/productsCatalog';
import { apiUrl } from '../config/api';

// Order Status definitions and helper for timeline progression
const TIMELINE_STEPS = [
  {
    key: 'Placed',
    label: 'Order Placed',
    tamilLabel: 'ஆர்டர் பெறப்பட்டது',
    description: 'Order received and verified into the preparation queue.',
    icon: Package
  },
  {
    key: 'Processing',
    matchKeys: ['Processing', 'Confirmed'],
    label: 'Processing & Fresh Packing',
    tamilLabel: 'தயாரிப்பு & பேக்கிங்',
    description: 'Fresh batch prepared and packed with traditional aroma seal.',
    icon: Clock
  },
  {
    key: 'Dispatched',
    matchKeys: ['Dispatched', 'Shipped'],
    label: 'Dispatched / In Transit',
    tamilLabel: 'அனுப்பப்பட்டது',
    description: 'Handed over to courier partner for prompt delivery.',
    icon: Truck
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    tamilLabel: 'டெலிவரி செய்யப்பட்டது',
    description: 'Safely delivered to customer address.',
    icon: CheckCircle2
  }
];

export default function TrackOrderPage({
  initialOrderId = '',
  initialMobile = '',
  onNavigateHome,
  onNavigateShop
}) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
  const [mobileInput, setMobileInput] = useState(initialMobile || '');
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const validateInputs = useCallback((idVal, mobileVal) => {
    const errors = {};
    const trimmedId = (idVal || '').trim();
    const trimmedMobile = (mobileVal || '').replace(/\D/g, '');

    if (!trimmedId) {
      errors.orderId = 'Please enter your Order Reference ID.';
    } else if (trimmedId.length < 5) {
      errors.orderId = 'Order Reference ID seems too short.';
    }

    if (!trimmedMobile) {
      errors.mobile = 'Please enter the 10-digit mobile number used at checkout.';
    } else if (trimmedMobile.length !== 10 && !(trimmedMobile.length === 12 && trimmedMobile.startsWith('91'))) {
      errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }

    return errors;
  }, []);

  const performTrack = useCallback(async (orderIdToTrack, mobileToTrack) => {
    const errors = validateInputs(orderIdToTrack, mobileToTrack);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const response = await fetch(apiUrl('/api/orders/track'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderIdToTrack.trim(),
          mobile: mobileToTrack.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No matching order found for the provided details.');
      }

      setOrderData(data.order);
      // Smooth scroll down to order timeline
      setTimeout(() => {
        const resultEl = document.getElementById('tracking-result-section');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);

    } catch (err) {
      setOrderData(null);
      setErrorMessage(err.message || 'Unable to retrieve order details. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }, [validateInputs]);

  // If initial credentials are provided (e.g. from Order Confirmation redirect), auto-track
  useEffect(() => {
    if (initialOrderId && initialMobile) {
      setOrderIdInput(initialOrderId);
      setMobileInput(initialMobile);
      performTrack(initialOrderId, initialMobile);
    }
  }, [initialOrderId, initialMobile, performTrack]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performTrack(orderIdInput, mobileInput);
  };

  const handleCopyOrderId = () => {
    if (orderData?.orderId) {
      navigator.clipboard.writeText(orderData.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setOrderData(null);
    setErrorMessage(null);
    setHasSearched(false);
    setOrderIdInput('');
    setMobileInput('');
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickFill = (demoId, demoPhone) => {
    setOrderIdInput(demoId);
    setMobileInput(demoPhone);
    setFormErrors({});
    performTrack(demoId, demoPhone);
  };

  // Helper to find image for item snapshot
  const getItemImage = (productId) => {
    const found = ALL_PRODUCTS.find((p) => p.id === productId);
    return found ? found.image : '/images/cat-snacks.jpg';
  };

  // Format date nicely
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Compute status step index
  // 0: Placed, 1: Processing/Confirmed, 2: Dispatched, 3: Delivered
  const getStepStatus = (stepIndex, orderStatus) => {
    if (orderStatus === 'Cancelled') {
      return 'cancelled';
    }

    const normalizedStatus = (orderStatus || 'Placed').toLowerCase();
    let currentActiveIndex = 0;

    if (normalizedStatus === 'delivered') {
      currentActiveIndex = 3;
    } else if (
      normalizedStatus === 'dispatched' || 
      normalizedStatus === 'shipped' || 
      normalizedStatus === 'out for delivery'
    ) {
      currentActiveIndex = 2;
    } else if (normalizedStatus === 'processing' || normalizedStatus === 'confirmed') {
      currentActiveIndex = 1;
    } else {
      currentActiveIndex = 0;
    }

    if (stepIndex < currentActiveIndex) return 'completed';
    if (stepIndex === currentActiveIndex) return 'active';
    return 'upcoming';
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'status-badge-delivered';
    if (s === 'out for delivery') return 'status-badge-out-for-delivery';
    if (s === 'dispatched' || s === 'shipped') return 'status-badge-dispatched';
    if (s === 'confirmed') return 'status-badge-confirmed';
    if (s === 'processing') return 'status-badge-processing';
    if (s === 'cancelled') return 'status-badge-cancelled';
    return 'status-badge-placed';
  };

  return (
    <div className="track-order-page">
      {/* 1. Header & Breadcrumbs */}
      <div className="track-header-banner">
        <div className="track-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Home</button>
            <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
            <span className="breadcrumb-current">Track Order</span>
          </nav>

          <div className="track-title-block">
            <div className="track-badge-pill">
              <Sparkles size={14} color="#d97706" />
              <span>Live Order Journey • நேரலை கண்காணிப்பு</span>
            </div>
            <h1 className="track-main-title">Track Your Order</h1>
            <p className="track-subtitle">
              Verify your Order Reference ID and registered mobile number to follow 
              the live progress of your handcrafted traditional snacks and sweets.
            </p>
          </div>
        </div>
      </div>

      <div className="track-container track-content-wrapper">
        {/* 2. Lookup Form Card */}
        <section className="track-card track-form-card" aria-labelledby="form-heading">
          <div className="track-form-header">
            <Search size={22} className="track-icon-accent" />
            <div>
              <h2 id="form-heading" className="track-form-title">Enter Order Information</h2>
              <p className="track-form-subtitle">Both details are required to protect customer order privacy.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="track-form" noValidate>
            <div className="track-inputs-grid">
              {/* Order ID Input */}
              <div className={`form-group ${formErrors.orderId ? 'has-error' : ''}`}>
                <label htmlFor="track-order-id" className="form-label">
                  Order Reference ID <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon-left">#</span>
                  <input
                    id="track-order-id"
                    type="text"
                    className="form-input text-uppercase"
                    placeholder="e.g. TT-ORD-20261026-1001"
                    value={orderIdInput}
                    onChange={(e) => {
                      setOrderIdInput(e.target.value);
                      if (formErrors.orderId) {
                        setFormErrors((prev) => ({ ...prev, orderId: null }));
                      }
                    }}
                    autoComplete="off"
                    aria-required="true"
                    aria-describedby={formErrors.orderId ? 'track-order-id-err' : 'track-order-id-help'}
                  />
                </div>
                {formErrors.orderId ? (
                  <span id="track-order-id-err" className="error-text" role="alert">
                    {formErrors.orderId}
                  </span>
                ) : (
                  <span id="track-order-id-help" className="form-hint">
                    Found on your order confirmation screen or SMS receipt.
                  </span>
                )}
              </div>

              {/* Mobile Number Input */}
              <div className={`form-group ${formErrors.mobile ? 'has-error' : ''}`}>
                <label htmlFor="track-mobile" className="form-label">
                  Registered Mobile Number <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon-left">+91</span>
                  <input
                    id="track-mobile"
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    maxLength={14}
                    value={mobileInput}
                    onChange={(e) => {
                      setMobileInput(e.target.value);
                      if (formErrors.mobile) {
                        setFormErrors((prev) => ({ ...prev, mobile: null }));
                      }
                    }}
                    autoComplete="tel"
                    aria-required="true"
                    aria-describedby={formErrors.mobile ? 'track-mobile-err' : 'track-mobile-help'}
                  />
                </div>
                {formErrors.mobile ? (
                  <span id="track-mobile-err" className="error-text" role="alert">
                    {formErrors.mobile}
                  </span>
                ) : (
                  <span id="track-mobile-help" className="form-hint">
                    The 10-digit mobile number provided at checkout.
                  </span>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="track-form-actions">
              <button
                type="submit"
                className="btn-primary btn-track-submit"
                disabled={isLoading}
                id="btn-track-submit"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    <span>Verifying Order Details...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Track Order Status</span>
                  </>
                )}
              </button>

              {hasSearched && (
                <button
                  type="button"
                  className="btn-secondary btn-track-reset"
                  onClick={handleReset}
                >
                  <RefreshCw size={16} />
                  <span>Clear & Search Another</span>
                </button>
              )}
            </div>
          </form>

          {/* Quick Demo Test Bar */}
          <div className="track-demo-bar">
            <span className="demo-label">Quick Test Sample Orders:</span>
            <div className="demo-chips">
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleQuickFill('TT-ORD-20261026-1001', '9876543210')}
                title="Load processing demo order"
              >
                <span>📦 Processing Order (9876543210)</span>
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleQuickFill('TT-ORD-20261025-2002', '9442012345')}
                title="Load dispatched demo order"
              >
                <span>🚚 Dispatched Order (9442012345)</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Error / Not Found Alert State */}
        {errorMessage && !isLoading && (
          <section className="track-alert-card error-card" role="alert">
            <div className="alert-icon-box">
              <AlertCircle size={32} color="#dc2626" />
            </div>
            <div className="alert-content">
              <h3 className="alert-title">Order Verification Failed</h3>
              <p className="alert-text">{errorMessage}</p>
              <ul className="alert-tips">
                <li>Double check that the <strong>Order Reference ID</strong> matches your confirmation.</li>
                <li>Ensure you enter the <strong>exact 10-digit mobile number</strong> used when ordering.</li>
                <li>For privacy reasons, order details are not shown unless both credentials match.</li>
              </ul>
            </div>
          </section>
        )}

        {/* 4. Verified Order Details & Visual Status Timeline */}
        {orderData && (
          <div id="tracking-result-section" className="track-results-container">
            {/* Top Order Summary Bar */}
            <div className="track-summary-card">
              <div className="summary-col-left">
                <span className="summary-label">Order Reference</span>
                <div className="summary-ref-row">
                  <h2 className="summary-order-id">{orderData.orderId}</h2>
                  <button
                    type="button"
                    className="btn-copy-mini"
                    onClick={handleCopyOrderId}
                    title="Copy Order ID"
                    aria-label="Copy Order ID"
                  >
                    {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="summary-date-row">
                  <Calendar size={14} className="summary-meta-icon" />
                  <span>Placed on: <strong>{formatDate(orderData.orderDate)}</strong></span>
                </div>
              </div>

              <div className="summary-col-right">
                <div className="summary-status-wrap">
                  <span className="summary-label">Current Status</span>
                  <div className={`status-pill ${getStatusBadgeClass(orderData.orderStatus)}`}>
                    <span className="status-dot"></span>
                    <strong className="status-name">{orderData.orderStatus}</strong>
                  </div>
                </div>

                <div className="summary-actions no-print">
                  <button
                    type="button"
                    className="btn-outline-print"
                    onClick={() => window.print()}
                    title="Print tracking summary"
                  >
                    <Printer size={15} />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cancelled Alert if order is cancelled */}
            {orderData.orderStatus === 'Cancelled' && (
              <div className="track-cancelled-banner">
                <XCircle size={26} color="#b91c1c" />
                <div>
                  <h4>Order Cancelled</h4>
                  <p>
                    This order was cancelled. If you have any questions or require support regarding refunds 
                    or replacement batches, please reach out to customer care at <strong>support@thaniyamtreats.com</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Visual Status Timeline */}
            <section className="track-card track-timeline-card" aria-label="Order Tracking Timeline">
              <div className="timeline-header">
                <div className="timeline-title-group">
                  <Clock size={20} color="#1b4332" />
                  <h3 className="timeline-heading">Order Status Timeline</h3>
                </div>
                <span className="timeline-subheading">
                  Last updated: {formatDate(orderData.lastUpdated)}
                </span>
              </div>

              <div className="timeline-flow">
                {TIMELINE_STEPS.map((step, idx) => {
                  const stepState = getStepStatus(idx, orderData.orderStatus);
                  const Icon = step.icon;
                  const isCurrent = stepState === 'active';
                  const isDone = stepState === 'completed';

                  return (
                    <div
                      key={step.key}
                      className={`timeline-step step-${stepState} ${isCurrent ? 'step-current' : ''}`}
                    >
                      {/* Connector Line */}
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={`step-connector ${isDone ? 'connector-done' : ''}`}
                          aria-hidden="true"
                        />
                      )}

                      {/* Step Indicator Node */}
                      <div className="step-node-wrap">
                        <div className="step-node" aria-hidden="true">
                          {isDone ? (
                            <CheckCircle2 size={20} className="node-icon-done" />
                          ) : (
                            <Icon size={18} className="node-icon" />
                          )}
                        </div>
                      </div>

                      {/* Step Details */}
                      <div className="step-body">
                        <div className="step-title-row">
                          <span className="step-title">{step.label}</span>
                          <span className={`step-badge badge-${stepState}`}>
                            {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                          </span>
                        </div>
                        <span className="step-tamil">{step.tamilLabel}</span>
                        <p className="step-desc">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status explanation note */}
              <div className="timeline-assurance-note">
                <ShieldCheck size={18} color="#15803d" />
                <span>
                  <strong>Heritage Kitchen Promise:</strong> All batches are made using cold-pressed oils 
                  and native millets. We never hold stale inventory.
                </span>
              </div>
            </section>

            {/* Order Items & Destination Details Grid */}
            <div className="track-details-grid">
              {/* Ordered Products Card */}
              <div className="track-card track-items-card">
                <div className="details-card-header">
                  <Package size={20} color="#1b4332" />
                  <h3 className="details-card-title">
                    Ordered Treats ({orderData.items?.length || 0})
                  </h3>
                </div>

                <div className="track-items-table-wrap">
                  <table className="track-items-table">
                    <thead>
                      <tr>
                        <th scope="col" className="th-product">Item</th>
                        <th scope="col" className="th-price">Price</th>
                        <th scope="col" className="th-qty">Qty</th>
                        <th scope="col" className="th-total">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orderData.items || []).map((item, i) => (
                        <tr key={i} className="track-item-row">
                          <td className="td-product">
                            <div className="item-cell-layout">
                              <img
                                src={getItemImage(item.productId)}
                                alt={item.name}
                                className="item-thumb-img"
                              />
                              <div className="item-info-text">
                                <span className="item-name">{item.name}</span>
                                {item.tamilName && (
                                  <span className="item-tamil">{item.tamilName}</span>
                                )}
                                {item.weight && (
                                  <span className="item-weight">{item.weight}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="td-price">₹{item.unitPrice}</td>
                          <td className="td-qty">{item.quantity}</td>
                          <td className="td-total bold">₹{item.lineTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pricing Summary */}
                <div className="track-totals-box">
                  <div className="total-line">
                    <span>Items Subtotal:</span>
                    <span className="val bold">₹{orderData.pricing?.subtotal}</span>
                  </div>
                  <div className="total-line">
                    <span>Shipping Charges:</span>
                    <span className="val free-tag">
                      {orderData.pricing?.shippingCharges > 0 
                        ? `₹${orderData.pricing.shippingCharges}` 
                        : 'Free Dispatch'}
                    </span>
                  </div>
                  <div className="total-line grand-total-line">
                    <span>Order Total:</span>
                    <span className="val grand-price">₹{orderData.pricing?.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Destination & Payment Details Card */}
              <div className="track-card track-destination-card">
                <div className="details-card-header">
                  <MapPin size={20} color="#1b4332" />
                  <h3 className="details-card-title">Delivery & Payment Info</h3>
                </div>

                <div className="destination-content">
                  <div className="info-row">
                    <span className="info-key">Recipient:</span>
                    <strong className="info-val">{orderData.recipientName}</strong>
                  </div>

                  <div className="info-row">
                    <span className="info-key">Destination:</span>
                    <span className="info-val">
                      {orderData.deliveryLocation?.city}
                      {orderData.deliveryLocation?.district ? `, ${orderData.deliveryLocation.district}` : ''}
                      <br />
                      {orderData.deliveryLocation?.state} — <strong>{orderData.deliveryLocation?.pincode}</strong>
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-key">Payment Mode:</span>
                    <span className="info-val">{orderData.payment?.method}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-key">Payment Status:</span>
                    <span className="info-val">
                      <span className="badge-payment-status">
                        {orderData.payment?.status || 'Pending'}
                      </span>
                    </span>
                  </div>

                  {orderData.deliveryNotes && (
                    <div className="info-row notes-row">
                      <span className="info-key">Customer Note:</span>
                      <p className="notes-val">"{orderData.deliveryNotes}"</p>
                    </div>
                  )}

                  {/* Customer Care Contact Help Box */}
                  <div className="support-help-box">
                    <div className="help-box-header">
                      <Phone size={16} color="#0f766e" />
                      <strong>Need Delivery Assistance?</strong>
                    </div>
                    <p className="help-box-text">
                      Our Coimbatore dispatch desk is available Monday to Saturday (9:30 AM – 6:30 PM).
                    </p>
                    <a href="tel:+919442000000" className="help-phone-link">
                      Call +91 94420 00000
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation CTAs */}
            <div className="track-bottom-cta no-print">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                <ArrowLeft size={16} />
                <span>Track Another Order</span>
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigateShop('all')}
              >
                <ShoppingBag size={16} />
                <span>Continue Shopping Handcrafted Treats</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
