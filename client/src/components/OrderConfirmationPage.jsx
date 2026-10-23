import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, PackageCheck, Truck, Calendar, MapPin, 
  Phone, Mail, ShoppingBag, ArrowLeft, Printer, ShieldCheck, 
  AlertCircle, Loader2, Copy, Check, Info 
} from 'lucide-react';
import { ALL_PRODUCTS } from '../data/productsCatalog';

export default function OrderConfirmationPage({
  orderId,
  initialOrder,
  onNavigateHome,
  onNavigateShop
}) {
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!orderId);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If order already provided in memory and matches the requested orderId, reuse it
    if (initialOrder && (!orderId || initialOrder.orderId === orderId)) {
      setOrder(initialOrder);
      setLoading(false);
      return;
    }

    if (!orderId) {
      setError('No Order Reference ID provided.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Order #${orderId} was not found.`);
        }
        return data.order;
      })
      .then((fetchedOrder) => {
        if (isMounted) {
          setOrder(fetchedOrder);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve your order details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [orderId, initialOrder]);

  const handleCopyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to find image for item snapshot
  const getItemImage = (productId) => {
    const found = ALL_PRODUCTS.find((p) => p.id === productId);
    return found ? found.image : '/images/cat-snacks.jpg';
  };

  // Format date nicely
  const formatDate = (isoString) => {
    if (!isoString) return new Date().toLocaleDateString('en-IN');
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

  if (loading) {
    return (
      <div className="order-conf-page">
        <div className="order-conf-container">
          <div className="order-loading-card">
            <Loader2 size={44} className="spinner" color="#1b4332" />
            <h2 className="loading-title">Retrieving Your Order Details...</h2>
            <p className="loading-desc">Fetching confirmed order #{orderId} from our secure store.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-conf-page">
        <div className="order-conf-container">
          <div className="order-error-card">
            <div className="error-icon-wrap">
              <AlertCircle size={48} color="#dc2626" />
            </div>
            <h2 className="error-title">Order Not Found</h2>
            <p className="error-desc">{error || 'We could not locate this order in our system.'}</p>
            <div className="error-actions">
              <button className="btn-secondary" onClick={onNavigateHome}>
                <ArrowLeft size={16} />
                <span>Return to Home</span>
              </button>
              <button className="btn-primary" onClick={() => onNavigateShop('all')}>
                <ShoppingBag size={16} />
                <span>Explore Products</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { customer, items, pricing, payment, createdAt } = order;

  return (
    <div className="order-conf-page">
      <div className="order-conf-container">
        {/* Success Header Banner */}
        <section className="order-conf-hero" aria-labelledby="conf-heading">
          <div className="conf-icon-badge">
            <CheckCircle2 size={42} strokeWidth={2.4} />
          </div>
          <span className="conf-tagline">Order Successfully Placed</span>
          <h1 id="conf-heading" className="conf-title">Thank You, {customer.fullName}!</h1>
          <p className="conf-subtitle">
            Your traditional treat order has been received and verified by our system. 
            We are preparing your fresh batch with heritage recipes.
          </p>

          {/* Quick reference pill */}
          <div className="order-ref-pill">
            <span className="ref-label">Order Number:</span>
            <strong className="ref-code">{order.orderId}</strong>
            <button 
              className="btn-copy-ref" 
              onClick={handleCopyOrderId}
              title="Copy Order ID"
              aria-label="Copy Order ID"
            >
              {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </section>

        {/* Action Toolbar (Print, Shop) */}
        <div className="conf-toolbar no-print">
          <button className="btn-secondary btn-print-receipt" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
          <button className="btn-primary" onClick={() => onNavigateShop('all')}>
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Order Details Grid */}
        <div className="order-details-grid">
          {/* Left Column: Order Items & Pricing */}
          <div className="conf-column-main">
            <div className="conf-card conf-items-card">
              <div className="conf-card-header">
                <PackageCheck size={20} color="#1b4332" />
                <h2 className="conf-card-title">Ordered Items ({items.length})</h2>
              </div>

              <div className="conf-items-table-wrap">
                <table className="conf-items-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-prod">Product</th>
                      <th scope="col" className="col-price">Unit Price</th>
                      <th scope="col" className="col-qty">Quantity</th>
                      <th scope="col" className="col-subtotal">Line Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="conf-item-row">
                        <td className="col-prod">
                          <div className="conf-prod-cell">
                            <img 
                              src={getItemImage(item.productId)} 
                              alt={item.name} 
                              className="conf-prod-img" 
                            />
                            <div className="conf-prod-text">
                              <span className="conf-prod-name">{item.name}</span>
                              {item.tamilName && (
                                <span className="conf-prod-tamil">{item.tamilName}</span>
                              )}
                              {item.weight && (
                                <span className="conf-prod-weight">{item.weight}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="col-price">₹{item.unitPrice}</td>
                        <td className="col-qty">{item.quantity}</td>
                        <td className="col-subtotal bold">₹{item.lineTotal || (item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="conf-totals-box">
                <div className="conf-total-row">
                  <span>Items Subtotal:</span>
                  <span className="bold">₹{pricing.subtotal}</span>
                </div>
                <div className="conf-total-row">
                  <span>Shipping & Packaging:</span>
                  <span className="free-badge">To be confirmed at dispatch</span>
                </div>
                <div className="conf-total-row final-total-row">
                  <span>Confirmed Order Total:</span>
                  <span className="conf-grand-price">₹{pricing.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Offline Payment Information Notice */}
            <div className="conf-card conf-notice-card">
              <div className="conf-card-header">
                <Info size={20} color="#0f766e" />
                <h3 className="conf-card-title">Payment Arrangements</h3>
              </div>
              <p className="conf-notice-text">
                Your order is confirmed under <strong>{payment?.method || 'Pay on Delivery / Direct Confirmation'}</strong>. 
                No payment gateway or card information was collected online.
                Our customer care team will call or message you on <strong>+91 {customer.mobile}</strong> to confirm dispatch timing and coordinate delivery.
              </p>
            </div>
          </div>

          {/* Right Column: Customer Details & Timeline */}
          <div className="conf-column-side">
            {/* Delivery Details Card */}
            <div className="conf-card">
              <div className="conf-card-header">
                <Truck size={20} color="#1b4332" />
                <h3 className="conf-card-title">Delivery Destination</h3>
              </div>
              <div className="conf-customer-info">
                <div className="info-item">
                  <span className="info-label">Recipient:</span>
                  <strong className="info-val">{customer.fullName}</strong>
                </div>

                <div className="info-item">
                  <Phone size={14} className="info-icon" />
                  <span className="info-label">Contact Mobile:</span>
                  <span className="info-val">+91 {customer.mobile}</span>
                </div>

                {customer.email && (
                  <div className="info-item">
                    <Mail size={14} className="info-icon" />
                    <span className="info-label">Email:</span>
                    <span className="info-val">{customer.email}</span>
                  </div>
                )}

                <div className="info-item address-block">
                  <MapPin size={14} className="info-icon" />
                  <span className="info-label">Shipping Address:</span>
                  <p className="info-address-text">
                    {customer.addressLine}<br />
                    {customer.city}{customer.district ? `, ${customer.district}` : ''}<br />
                    {customer.state} — <strong>{customer.pincode}</strong><br />
                    India
                  </p>
                </div>

                {customer.deliveryNotes && (
                  <div className="info-item notes-block">
                    <span className="info-label">Delivery Note:</span>
                    <p className="info-note-text">"{customer.deliveryNotes}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Meta Card */}
            <div className="conf-card">
              <div className="conf-card-header">
                <Calendar size={20} color="#1b4332" />
                <h3 className="conf-card-title">Order Status & Timeline</h3>
              </div>
              <div className="conf-meta-list">
                <div className="meta-row">
                  <span>Order Placed:</span>
                  <strong>{formatDate(createdAt)}</strong>
                </div>
                <div className="meta-row">
                  <span>Status:</span>
                  <span className="status-badge-placed">{order.orderStatus || 'Placed'}</span>
                </div>
                <div className="meta-row">
                  <span>Payment Status:</span>
                  <span className="status-badge-pending">{payment?.status || 'Pending'}</span>
                </div>
              </div>

              <div className="conf-security-tag">
                <ShieldCheck size={16} color="#15803d" />
                <span>100% Traditional Quality Assured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="conf-bottom-cta no-print">
          <button className="btn-secondary" onClick={onNavigateHome}>
            <ArrowLeft size={16} />
            <span>Return to Homepage</span>
          </button>
          <button className="btn-primary" onClick={() => onNavigateShop('all')}>
            <ShoppingBag size={16} />
            <span>Explore More Handcrafted Snacks</span>
          </button>
        </div>
      </div>
    </div>
  );
}
