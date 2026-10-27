/**
 * Step 11 - Comprehensive Final Verification Suite for Thaniyam Treats MVP
 * Tests all backend aspects of the 11-point testing checklist:
 * 1. Product Catalog & Active Items
 * 2. Cart Totals & Pricing Arithmetic
 * 3. Checkout Validation & Creation
 * 4. Customer Tracking with Privacy
 * 5. Admin Authentication & Route Protection
 * 6. Admin Order Querying, Search & Status Flow
 * 7. Inventory Management, Out-of-Stock & Atomic Deduction
 * 8. Stock Restoration on Cancellation
 * 9. Safe Soft-Deactivation of Ordered Products
 * 10. Robustness against Malformed Payloads & Edge Cases
 */

const BASE_URL = 'http://localhost:5000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`❌ FAIL: ${message}`);
  }
}

async function runStep11Suite() {
  console.log('🏁 Starting Step 11 Comprehensive Verification Suite...\n');

  // --- 1. Product Catalog & Data Integrity ---
  console.log('📦 --- Section 1: Product Catalog & Item Structure ---');
  const catRes = await fetch(`${BASE_URL}/api/products`);
  assert(catRes.ok, 'GET /api/products returns HTTP 200 OK');
  const catData = await catRes.json();
  assert(catData.success && Array.isArray(catData.products), 'Catalog response contains products array');
  assert(catData.products.length >= 18, `Active catalog has ${catData.products.length} products (expected >= 18)`);

  const firstProduct = catData.products[0];
  assert(
    firstProduct.id &&
    firstProduct.name &&
    typeof firstProduct.price === 'number' &&
    firstProduct.category &&
    typeof firstProduct.stock === 'number',
    'Catalog product has valid id, name, price, category, and stock'
  );

  // --- 2. Single Product Retrieval & Invalid ID Handling ---
  console.log('\n🔍 --- Section 2: Product Detail & Error Handling ---');
  const singleRes = await fetch(`${BASE_URL}/api/products/${firstProduct.id}`);
  assert(singleRes.ok, `GET /api/products/${firstProduct.id} returns 200 OK`);
  const singleData = await singleRes.json();
  assert(singleData.product.id === firstProduct.id, 'Retrieved product matches requested ID');

  const invalidProductRes = await fetch(`${BASE_URL}/api/products/non-existent-product-id`);
  assert(invalidProductRes.status === 404, 'GET invalid product ID correctly returns HTTP 404');

  // --- 3. Authentication & Security (Admin Route Protection) ---
  console.log('\n🔒 --- Section 3: Auth & Security (Admin Protection) ---');
  const unauthRes = await fetch(`${BASE_URL}/api/orders/admin`);
  assert(unauthRes.status === 401, 'Accessing /api/orders/admin without token returns HTTP 401 Unauthorized');

  const invalidTokenRes = await fetch(`${BASE_URL}/api/orders/admin`, {
    headers: { Authorization: 'Bearer invalid_bogus_token' }
  });
  assert(invalidTokenRes.status === 401, 'Accessing /api/orders/admin with invalid token returns HTTP 401 Unauthorized');

  const unauthInventoryRes = await fetch(`${BASE_URL}/api/products/admin/all`);
  assert(unauthInventoryRes.status === 401, 'Accessing /api/products/admin/all without token returns HTTP 401');

  // Admin Login
  const loginRes = await fetch(`${BASE_URL}/api/orders/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert(loginRes.ok, 'Admin login with valid credentials returns 200 OK');
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(!!token, 'Admin session token received');

  // Verify Admin Access with Valid Token
  const authOrdersRes = await fetch(`${BASE_URL}/api/orders/admin`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(authOrdersRes.ok, 'GET /api/orders/admin with valid token returns 200 OK');

  // --- 4. Checkout Validation (Customer Details & Items) ---
  console.log('\n🛒 --- Section 4: Checkout Validation & Error Handling ---');
  // Missing customer object
  const emptyRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert(emptyRes.status === 400, 'Order without customer details rejected with 400');

  // Invalid mobile
  const badMobileRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Test User', mobile: '123' },
      items: [{ id: firstProduct.id, quantity: 1 }]
    })
  });
  assert(badMobileRes.status === 400, 'Order with invalid mobile rejected with 400');

  // Empty items array
  const emptyItemsRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        fullName: 'Ramanathan',
        mobile: '9840123456',
        addressLine: '12 Temple Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001'
      },
      items: []
    })
  });
  assert(emptyItemsRes.status === 400, 'Order with empty items array rejected with 400');

  // --- 5. Order Creation & Calculation Integrity ---
  console.log('\n📝 --- Section 5: Order Creation & Pricing Integrity ---');
  // Pick two products with known stock
  const p1 = catData.products[0];
  const p2 = catData.products[1];
  const expectedSubtotal = (p1.price * 2) + (p2.price * 1);
  const expectedTotal = expectedSubtotal;

  const validOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        fullName: 'Kavitha Natarajan',
        mobile: '9876543210',
        email: 'kavitha@example.com',
        addressLine: '88 Heritage Lane',
        city: 'Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641001',
        deliveryNotes: 'Please ring the bell'
      },
      items: [
        { id: p1.id, quantity: 2 },
        { id: p2.id, quantity: 1 }
      ]
    })
  });
  assert(validOrderRes.ok, 'Valid order placement returns 201 Created');
  const validOrderData = await validOrderRes.json();
  const createdOrder = validOrderData.order;

  assert(createdOrder.orderId && createdOrder.orderId.startsWith('TT-ORD-'), `Valid Order ID generated: ${createdOrder.orderId}`);
  assert(createdOrder.orderStatus === 'Placed', `Order status is 'Placed'`);
  assert(createdOrder.items.length === 2, 'Order has 2 items');
  const actualTotal = createdOrder.pricing?.totalAmount ?? createdOrder.totalAmount;
  assert(actualTotal === expectedTotal, `Total amount correctly calculated: ₹${actualTotal} (expected ₹${expectedTotal})`);

  // --- 6. Customer Order Tracking & Data Privacy ---
  console.log('\n🚚 --- Section 6: Customer Order Tracking & Data Privacy ---');
  const trackRes = await fetch(`${BASE_URL}/api/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: createdOrder.orderId,
      mobile: '9876543210'
    })
  });
  assert(trackRes.ok, 'Tracking with matching Order ID & Mobile returns 200 OK');
  const trackData = await trackRes.json();
  assert(trackData.success && trackData.order.orderId === createdOrder.orderId, 'Tracking returns the correct order');
  assert(trackData.order.orderStatus === 'Placed', 'Tracking returns current status: Placed');
  assert(!trackData.order.adminNotes, 'Tracking does NOT leak internal admin notes');

  // Tracking with wrong phone number must fail
  const wrongPhoneTrackRes = await fetch(`${BASE_URL}/api/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: createdOrder.orderId,
      mobile: '9999999999'
    })
  });
  assert(wrongPhoneTrackRes.status === 404, 'Tracking with mismatched phone number returns 404 Not Found');

  // --- 7. Admin Order Lifecycle & Customer Tracking Sync ---
  console.log('\n⚙️ --- Section 7: Admin Order Management & Live Sync ---');
  // Admin search by order ID
  const searchRes = await fetch(`${BASE_URL}/api/orders/admin?search=${encodeURIComponent(createdOrder.orderId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const searchData = await searchRes.json();
  assert(searchData.orders.some(o => o.orderId === createdOrder.orderId), 'Admin search locates the new order');

  // Admin status progression: Placed -> Confirmed -> Shipped -> Delivered
  const updateStatusRes = await fetch(`${BASE_URL}/api/orders/admin/${createdOrder.orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Shipped' })
  });
  assert(updateStatusRes.ok, 'Admin status update to "Shipped" returns 200 OK');

  // Customer tracking should immediately show "Shipped"
  const trackUpdatedRes = await fetch(`${BASE_URL}/api/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: createdOrder.orderId,
      mobile: '9876543210'
    })
  });
  const trackUpdatedData = await trackUpdatedRes.json();
  assert(trackUpdatedData.order.orderStatus === 'Shipped', 'Customer tracking immediately reflects updated status "Shipped"');

  // --- 8. Inventory Depletion & Out-of-Stock Protection ---
  console.log('\n📊 --- Section 8: Inventory Limits & Out-of-Stock Handling ---');
  // Create a limited-stock product for rigorous testing
  const createProdRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Special Village Black Urad Halwa',
      tamilName: 'உளுந்தங்களி அல்வா',
      category: 'millet-sweets',
      categoryName: 'Millet Sweets & Delights',
      price: 180,
      stock: 2,
      weight: '250g',
      description: 'Handcrafted with organic palm jaggery.'
    })
  });
  assert(createProdRes.ok, 'New test product created with stock = 2');
  const createProdData = await createProdRes.json();
  const testProdId = createProdData.product.id;

  // Attempt to buy 3 (more than 2 available)
  const overOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        fullName: 'Anitha S',
        mobile: '9840112233',
        addressLine: '12 Gandhi Road',
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636001'
      },
      items: [{ id: testProdId, quantity: 3 }]
    })
  });
  assert(overOrderRes.status === 400, 'Attempt to purchase beyond available stock (3 > 2) is rejected with 400');

  // Purchase remaining 2 units
  const buyExactRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        fullName: 'Anitha S',
        mobile: '9840112233',
        addressLine: '12 Gandhi Road',
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636001'
      },
      items: [{ id: testProdId, quantity: 2 }]
    })
  });
  assert(buyExactRes.ok, 'Purchase of exact remaining stock (2 units) succeeds');
  const buyExactData = await buyExactRes.json();
  const depletionOrderId = buyExactData.order.orderId;

  // Verify product is now 0 stock and inStock = false
  const checkStockRes = await fetch(`${BASE_URL}/api/products/${testProdId}`);
  const checkStockData = await checkStockRes.json();
  assert(checkStockData.product.stock === 0, 'Product stock is now 0');
  assert(checkStockData.product.inStock === false, 'Product inStock is now false');

  // Attempt to buy when stock is 0
  const zeroStockOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        fullName: 'Bala Krishnan',
        mobile: '9840445566',
        addressLine: '44 Main Road',
        city: 'Trichy',
        state: 'Tamil Nadu',
        pincode: '620001'
      },
      items: [{ id: testProdId, quantity: 1 }]
    })
  });
  assert(zeroStockOrderRes.status === 400, 'Purchase of sold-out product is rejected with 400 Out of Stock');

  // --- 9. Stock Restoration on Cancellation ---
  console.log('\n🔄 --- Section 9: Stock Restoration on Order Cancellation ---');
  const cancelOrderRes = await fetch(`${BASE_URL}/api/orders/admin/${depletionOrderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Cancelled' })
  });
  assert(cancelOrderRes.ok, 'Admin cancelled order for depleted product');

  const restoredProdRes = await fetch(`${BASE_URL}/api/products/${testProdId}`);
  const restoredProdData = await restoredProdRes.json();
  assert(restoredProdData.product.stock === 2, `Product stock restored to 2 (actual: ${restoredProdData.product.stock})`);
  assert(restoredProdData.product.inStock === true, 'Product inStock flag restored to true');

  // --- 10. Safe Deactivation (Ensuring Historical Integrity) ---
  console.log('\n🛡️ --- Section 10: Safe Deactivation vs Hard Deletion ---');
  const deleteOrderedProdRes = await fetch(`${BASE_URL}/api/products/${testProdId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(deleteOrderedProdRes.ok, 'DELETE product with order history returns 200 OK');
  const deleteData = await deleteOrderedProdRes.json();
  assert(deleteData.action === 'deactivated', 'Product was safely deactivated (action === "deactivated") to preserve order receipts');

  // Customer order tracking for the cancelled order must still work and show product name
  const trackingHistoricalRes = await fetch(`${BASE_URL}/api/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: depletionOrderId,
      mobile: '9840112233'
    })
  });
  const trackingHistoricalData = await trackingHistoricalRes.json();
  assert(
    trackingHistoricalData.success &&
    trackingHistoricalData.order.items[0].name === 'Special Village Black Urad Halwa',
    'Customer tracking for historical order remains 100% intact after product deactivation'
  );

  // Deactivated product must NOT appear in public catalog
  const publicCatAfterRes = await fetch(`${BASE_URL}/api/products`);
  const publicCatAfterData = await publicCatAfterRes.json();
  assert(!publicCatAfterData.products.some(p => p.id === testProdId), 'Deactivated product does NOT appear in customer public catalog');

  // Admin inventory CAN still see deactivated products with isActive: false
  const adminInvRes = await fetch(`${BASE_URL}/api/products/admin/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const adminInvData = await adminInvRes.json();
  assert(adminInvData.products.some(p => p.id === testProdId && p.isActive === false), 'Admin inventory preserves deactivated product record');

  console.log('\n========================================');
  console.log(`Step 11 Test Summary: ${passedTests} passed, ${failedTests} failed (Total: ${totalTests})`);
  console.log('========================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runStep11Suite().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
