import React, { useState } from 'react';
import { 
  Printer, X, Copy, Check, FileText, Phone, MapPin, 
  Mail, Calendar, ShieldCheck, Truck, ArrowLeft
} from 'lucide-react';
import { 
  STORE_INFO, formatBillDate, numberToWords, 
  generateWhatsAppBillText, openWhatsAppBill 
} from '../utils/billUtils';

// WhatsApp Official SVG Icon
function WhatsAppIcon({ size = 18, color = '#25d366' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export default function InvoiceModal({ order, isOpen, onClose, isAdmin = false }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const { customer = {}, items = [], pricing = {}, payment = {}, orderId, createdAt } = order;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBill = () => {
    const text = generateWhatsAppBillText(order);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendWhatsAppCustomer = () => {
    openWhatsAppBill(order, customer.mobile || '');
  };

  const handleShareWhatsAppGeneral = () => {
    openWhatsAppBill(order, '');
  };

  const totalAmount = pricing.totalAmount || pricing.subtotal || 0;
  const subtotal = pricing.subtotal || totalAmount;

  return (
    <div className="invoice-modal-backdrop" onClick={onClose}>
      <div 
        className="invoice-modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-heading"
      >
        {/* Modal Action Header (Hidden during Print) */}
        <div className="invoice-modal-header-actions no-print">
          <div className="invoice-header-title-box">
            <FileText size={20} className="invoice-icon-accent" />
            <div>
              <h2 id="invoice-heading" className="invoice-title">
                Tax Invoice / Bill — #{orderId}
              </h2>
              <span className="invoice-subtitle">Official Receipt & Packing Slip</span>
            </div>
          </div>

          <div className="invoice-action-buttons">
            <button 
              type="button" 
              className="btn-invoice-action btn-print-now"
              onClick={handlePrint}
              title="Print official receipt or save as PDF"
            >
              <Printer size={16} />
              <span>Print Bill</span>
            </button>

            {isAdmin ? (
              <button 
                type="button" 
                className="btn-invoice-action btn-wa-send"
                onClick={handleSendWhatsAppCustomer}
                title="Send invoice bill to customer's WhatsApp (+91 mobile)"
              >
                <WhatsAppIcon size={16} color="#ffffff" />
                <span>WhatsApp to Customer</span>
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-invoice-action btn-wa-send"
                onClick={handleShareWhatsAppGeneral}
                title="Send or share bill on WhatsApp"
              >
                <WhatsAppIcon size={16} color="#ffffff" />
                <span>Send via WhatsApp</span>
              </button>
            )}

            <button 
              type="button" 
              className="btn-invoice-action btn-copy-bill"
              onClick={handleCopyBill}
              title="Copy WhatsApp formatted receipt to clipboard"
            >
              {copied ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Bill'}</span>
            </button>

            <button 
              type="button" 
              className="btn-invoice-close"
              onClick={onClose}
              aria-label="Close invoice"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="invoice-paper-wrapper" id="thaniyam-printable-invoice">
          {/* Top Header Banner */}
          <div className="inv-header">
            <div className="inv-brand-left">
              <div className="inv-logo-title">
                <span className="inv-logo-symbol">🌾</span>
                <span className="inv-store-name">{STORE_INFO.name}</span>
              </div>
              <div className="inv-tamil-name">{STORE_INFO.tamilName}</div>
              <p className="inv-tagline">{STORE_INFO.tagline}</p>
              <div className="inv-address-line">
                <MapPin size={12} /> {STORE_INFO.address}
              </div>
              <div className="inv-contact-line">
                <span><Phone size={12} /> {STORE_INFO.phone}</span>
                <span>•</span>
                <span><Mail size={12} /> {STORE_INFO.email}</span>
                {STORE_INFO.fssai && (
                  <>
                    <span>•</span>
                    <span>FSSAI Lic: <strong>{STORE_INFO.fssai}</strong></span>
                  </>
                )}
              </div>
            </div>

            <div className="inv-meta-right">
              <div className="inv-badge-bill">RETAIL INVOICE / CASH BILL</div>
              <div className="inv-meta-table">
                <div className="inv-meta-row">
                  <span className="inv-meta-label">Invoice No:</span>
                  <strong className="inv-meta-val inv-order-id">#{orderId}</strong>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">Date & Time:</span>
                  <span className="inv-meta-val">{formatBillDate(createdAt)}</span>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">Payment Mode:</span>
                  <strong className="inv-meta-val">{payment.method || 'Cash on Delivery'}</strong>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">Payment Status:</span>
                  <span className={`inv-status-chip ${payment.status === 'Paid' ? 'paid' : 'pending'}`}>
                    {payment.status || 'Pending'}
                  </span>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">Order Status:</span>
                  <span className="inv-order-status-tag">{order.orderStatus || 'Order Placed'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="inv-divider-thick"></div>

          {/* Customer & Shipping Information Box */}
          <div className="inv-customer-box">
            <div className="inv-cust-col">
              <span className="inv-section-title">BILL TO / DELIVER TO:</span>
              <div className="inv-cust-name">{customer.fullName || 'Valued Customer'}</div>
              <div className="inv-cust-detail">
                <strong>Phone:</strong> {customer.mobile || '—'}
              </div>
              {customer.email && (
                <div className="inv-cust-detail">
                  <strong>Email:</strong> {customer.email}
                </div>
              )}
              <div className="inv-cust-address">
                <strong>Delivery Address:</strong><br />
                {customer.addressLine && <div>{customer.addressLine}</div>}
                <div>
                  {[customer.city, customer.district, customer.state].filter(Boolean).join(', ')}
                  {customer.pincode && <span> — PIN: {customer.pincode}</span>}
                </div>
              </div>
            </div>

            {customer.deliveryNotes && (
              <div className="inv-notes-col">
                <span className="inv-section-title">DELIVERY INSTRUCTIONS:</span>
                <p className="inv-notes-text">"{customer.deliveryNotes}"</p>
              </div>
            )}
          </div>

          {/* Itemized Products Table */}
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th className="th-sno">S.No</th>
                  <th className="th-desc">Particulars / Food Item</th>
                  <th className="th-weight">Pack Size</th>
                  <th className="th-rate">Unit Rate</th>
                  <th className="th-qty">Qty</th>
                  <th className="th-amount text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineTotal = item.lineTotal || (item.unitPrice * item.quantity);
                  return (
                    <tr key={item.productId || idx} className="inv-row">
                      <td className="td-sno">{idx + 1}</td>
                      <td className="td-desc">
                        <div className="inv-item-name">{item.name}</div>
                        {item.tamilName && (
                          <div className="inv-item-tamil">{item.tamilName}</div>
                        )}
                      </td>
                      <td className="td-weight">{item.weight || 'Standard'}</td>
                      <td className="td-rate">₹{item.unitPrice}</td>
                      <td className="td-qty">{item.quantity}</td>
                      <td className="td-amount text-right bold">₹{lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculation and Totals Summary */}
          <div className="inv-bottom-section">
            <div className="inv-bottom-left">
              <div className="inv-amount-words">
                <span className="words-label">Amount in Words:</span>
                <p className="words-text">{numberToWords(totalAmount)}</p>
              </div>
              <div className="inv-declaration-box">
                <strong>Declaration:</strong>
                <p>
                  Certified that the particulars given above are true and correct. 
                  All food items are prepared fresh using traditional methods and cold-pressed heritage oils.
                </p>
              </div>
            </div>

            <div className="inv-bottom-right">
              <div className="inv-calc-table">
                <div className="inv-calc-row">
                  <span>Subtotal ({items.length} items):</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="inv-calc-row">
                  <span>Packaging & Delivery:</span>
                  <span className="inv-free-tag">FREE (₹0)</span>
                </div>
                <div className="inv-calc-row inv-grand-total">
                  <strong>Total Amount:</strong>
                  <strong className="inv-total-price">₹{totalAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="inv-sign-box">
                <div className="inv-sign-line"></div>
                <span className="inv-sign-label">Authorized Signatory</span>
                <span className="inv-sign-brand">For {STORE_INFO.name}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="inv-footer-note">
            <p>🙏 Thank you for supporting native farmers and traditional food heritage!</p>
            <p className="inv-website-hint">Visit us again at {STORE_INFO.website} | Customer Care: {STORE_INFO.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
