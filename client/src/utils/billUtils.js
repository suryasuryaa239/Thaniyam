/**
 * Bill, Invoice & WhatsApp Utilities for Thaniyam Heritage Foods
 */

export const STORE_INFO = {
  name: 'Thaniyam Heritage Foods',
  tamilName: 'தானியம் பாரம்பரிய உணவுப் பொருட்கள்',
  tagline: 'Authentic Heritage Foods & Wood-Pressed Oils',
  address: '42, Heritage Bazaar, Coimbatore, Tamil Nadu - 641001, India',
  phone: '+91 94420 00000',
  storeWhatsApp: '919442000000',
  email: 'support@thaniyamtreats.com',
  website: 'thaniyamtreats.com',
  fssai: '12423008000123'
};

/**
 * Format a date nicely for invoices & receipts
 */
export function formatBillDate(isoString) {
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
}

/**
 * Clean phone number to digits only (prepending 91 if 10-digit Indian number)
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Convert number to Indian Rupees in words
 */
export function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const rounded = Math.round(Number(num) || 0);
  if (rounded === 0) return 'Zero Rupees Only';
  return (inWords(rounded).trim() + ' Rupees Only');
}

/**
 * Generate formatted WhatsApp receipt / bill message
 */
export function generateWhatsAppBillText(order) {
  if (!order) return '';
  const customer = order.customer || {};
  const items = order.items || [];
  const pricing = order.pricing || {};
  const payment = order.payment || {};
  const orderId = order.orderId || 'N/A';
  const dateStr = formatBillDate(order.createdAt);

  const addressParts = [
    customer.addressLine,
    customer.city,
    customer.district,
    customer.state ? `${customer.state} - ${customer.pincode || ''}` : customer.pincode
  ].filter(Boolean).join(', ');

  const itemsListText = items.map((item, index) => {
    const weightStr = item.weight ? ` (${item.weight})` : '';
    const lineTotal = item.lineTotal || (item.unitPrice * item.quantity);
    return `${index + 1}. *${item.name}*${weightStr}\n   ₹${item.unitPrice} × ${item.quantity} = *₹${lineTotal}*`;
  }).join('\n');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thaniyamtreats.com';
  const trackingUrl = `${origin}/#/track-order?orderId=${encodeURIComponent(orderId)}&mobile=${encodeURIComponent(customer.mobile || '')}`;

  return `🌿 *${STORE_INFO.name.toUpperCase()}* 🌿
_${STORE_INFO.tamilName}_
━━━━━━━━━━━━━━━━━━━━
🧾 *TAX INVOICE & ORDER BILL*
━━━━━━━━━━━━━━━━━━━━
*Order ID:* #${orderId}
*Date:* ${dateStr}
*Status:* ${order.orderStatus || 'Order Placed'}

👤 *CUSTOMER DETAILS:*
*Name:* ${customer.fullName || 'Valued Customer'}
*Mobile:* ${customer.mobile || '—'}
*Delivery Address:*
${addressParts || '—'}
${customer.deliveryNotes ? `*Special Notes:* _"${customer.deliveryNotes}"_\n` : ''}
📦 *ORDERED ITEMS (${items.length}):*
${itemsListText}

━━━━━━━━━━━━━━━━━━━━
💰 *Items Subtotal:* ₹${(pricing.subtotal || pricing.totalAmount || 0).toLocaleString('en-IN')}
🚚 *Delivery & Packing:* FREE (₹0)
✨ *GRAND TOTAL:* *₹${(pricing.totalAmount || 0).toLocaleString('en-IN')}*
💳 *Payment Mode:* ${payment.method || 'Cash on Delivery'} (${payment.status || 'Pending'})
━━━━━━━━━━━━━━━━━━━━
🔍 *Track Live Order Status:*
${trackingUrl}

🙏 *Thank you for choosing Thaniyam Treats!*
Authentic Heritage Foods • Wood-Pressed Oils • 100% Pure`;
}

/**
 * Open WhatsApp with the order bill
 * @param {Object} order - Order object
 * @param {string} targetPhone - Optional target phone number (e.g. customer's or store's)
 */
export function openWhatsAppBill(order, targetPhone = '') {
  const text = generateWhatsAppBillText(order);
  const cleanedPhone = cleanPhoneNumber(targetPhone);

  let url = '';
  if (cleanedPhone) {
    url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
