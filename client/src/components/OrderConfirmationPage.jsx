import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, PackageCheck, Truck, Calendar, MapPin, 
  Phone, Mail, ShoppingBag, ArrowLeft, Printer, ShieldCheck, 
  AlertCircle, Loader2, Copy, Check, Info, Share2 
} from 'lucide-react';
import { ALL_PRODUCTS } from '../data/productsCatalog';
import InvoiceModal from './InvoiceModal';
import { STORE_INFO, openWhatsAppBill } from '../utils/billUtils';
import { apiUrl } from '../config/api';

function WhatsAppIcon({ size = 18, color = '#25d366' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export default function OrderConfirmationPage({
  orderId,
  initialOrder,
  onNavigateHome,
  onNavigateShop,
  onNavigateTrack
}) {
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!orderId);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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

    fetch(apiUrl(`/api/orders/${orderId}`))
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

        {/* Action Toolbar (WhatsApp Bill, Track, Print, Shop) */}
        <div className="conf-toolbar no-print">
          <button 
            type="button"
            className="btn-whatsapp-conf" 
            onClick={() => openWhatsAppBill(order, customer.mobile)}
            title="Send official bill receipt to your WhatsApp"
            id="btn-conf-wa-bill"
          >
            <WhatsAppIcon size={18} color="#ffffff" />
            <span>Send Bill to WhatsApp</span>
          </button>

          {onNavigateTrack && (
            <button 
              className="btn-primary btn-track-order-cta" 
              onClick={() => onNavigateTrack(order.orderId, customer.mobile)}
              id="btn-conf-track-order"
            >
              <Truck size={16} />
              <span>Track Live Status</span>
            </button>
          )}

          <button 
            type="button"
            className="btn-secondary btn-print-receipt" 
            onClick={() => setShowInvoiceModal(true)}
            title="View printable tax invoice and bill"
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>

          <button className="btn-secondary" onClick={() => onNavigateShop('all')}>
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* WhatsApp Bill Confirmation Banner */}
        <div className="conf-whatsapp-banner no-print">
          <div className="conf-wa-icon-col">
            <WhatsAppIcon size={30} color="#25d366" />
          </div>
          <div className="conf-wa-text-col">
            <h3 className="conf-wa-heading">
              📲 Get / Send Your Bill on WhatsApp
            </h3>
            <p className="conf-wa-desc">
              Instantly receive your official bill receipt on WhatsApp or send order confirmation directly to the Thaniyam store.
            </p>
            <div className="conf-wa-actions">
              <button
                type="button"
                className="btn-wa-pill primary"
                onClick={() => openWhatsAppBill(order, customer.mobile)}
                title="Send bill to your own WhatsApp number"
              >
                <WhatsAppIcon size={16} color="#ffffff" />
                <span>Send to My WhatsApp ({customer.mobile || 'Registered'})</span>
              </button>

              <button
                type="button"
                className="btn-wa-pill secondary"
                onClick={() => openWhatsAppBill(order, STORE_INFO.storeWhatsApp)}
                title="Send order bill directly to Thaniyam Store WhatsApp"
              >
                <WhatsAppIcon size={16} color="#1b4332" />
                <span>Send to Store WhatsApp</span>
              </button>

              <button
                type="button"
                className="btn-wa-pill outline"
                onClick={() => openWhatsAppBill(order, '')}
                title="Share bill to family or any chat"
              >
                <Share2 size={15} />
                <span>Share Bill to Any Chat</span>
              </button>
            </div>
          </div>
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

              {onNavigateTrack && (
                <div className="conf-track-prompt" style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    Follow this parcel throughout its journey from preparation to your doorstep:
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.86rem' }}
                    onClick={() => onNavigateTrack(order.orderId, customer.mobile)}
                  >
                    <Truck size={15} color="#1b4332" />
                    <span>Open Live Order Tracking</span>
                  </button>
                </div>
              )}
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

      {/* Invoice Modal for Customer Printing & WhatsApp Sharing */}
      {order && (
        <InvoiceModal
          order={order}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          isAdmin={false}
        />
      )}
    </div>
  );
}
