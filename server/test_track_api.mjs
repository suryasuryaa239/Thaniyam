// Comprehensive test suite for Step 8 Order Tracking API
async function runTests() {
  const BASE_URL = 'http://127.0.0.1:5000/api/orders';
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failedCount++;
    }
  }

  console.log('🧪 Starting Step 8 Order Tracking API Verification...\n');

  // Test 1: Missing parameters
  try {
    const res = await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, 'Test 1: Rejects empty request with 400');
  } catch (err) {
    assert(false, `Test 1 Error: ${err.message}`);
  }

  // Test 2: Invalid mobile format
  try {
    const res = await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'TT-ORD-20261026-1001', mobile: '12345' })
    });
    const data = await res.json();
    assert(res.status === 400 && data.message.includes('valid 10-digit'), 'Test 2: Rejects invalid mobile with 400');
  } catch (err) {
    assert(false, `Test 2 Error: ${err.message}`);
  }

  // Test 3: Valid order ID and matching mobile
  try {
    const res = await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'TT-ORD-20261026-1001', mobile: '9876543210' })
    });
    const data = await res.json();
    const order = data.order;

    assert(res.status === 200 && data.success === true, 'Test 3a: Returns 200 for valid credentials');
    assert(order.orderId === 'TT-ORD-20261026-1001', 'Test 3b: Matches correct order ID');
    assert(order.orderStatus === 'Processing', 'Test 3c: Returns correct order status (Processing)');
    assert(Array.isArray(order.items) && order.items.length === 2, 'Test 3d: Returns ordered items');
    assert(order.pricing?.totalAmount === 395, 'Test 3e: Returns order total amount (395)');
    assert(order._id === undefined && order.__v === undefined, 'Test 3f: Privacy - Database internals are NOT exposed');
    assert(order.deliveryLocation?.city === 'Coimbatore', 'Test 3g: Location details included safely');
  } catch (err) {
    assert(false, `Test 3 Error: ${err.message}`);
  }

  // Test 4: Valid order ID with WRONG mobile number (privacy check)
  let wrongMobileMsg = '';
  try {
    const res = await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'TT-ORD-20261026-1001', mobile: '9999999999' })
    });
    const data = await res.json();
    wrongMobileMsg = data.message;
    assert(res.status === 404 && data.success === false, 'Test 4: Wrong mobile returns 404 without exposing order');
  } catch (err) {
    assert(false, `Test 4 Error: ${err.message}`);
  }

  // Test 5: Non-existent order ID (generic error message parity check)
  try {
    const res = await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'TT-ORD-99999999-0000', mobile: '9876543210' })
    });
    const data = await res.json();
    assert(res.status === 404 && data.success === false, 'Test 5a: Non-existent order returns 404');
    assert(data.message === wrongMobileMsg, 'Test 5b: Generic error message prevents account enumeration');
  } catch (err) {
    assert(false, `Test 5 Error: ${err.message}`);
  }

  // Test 6: Mobile with +91 country prefix and spaces normalization
  try {
    const res = await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'TT-ORD-20261025-2002', mobile: '+91 94420 12345' })
    });
    const data = await res.json();
    assert(res.status === 200 && data.order?.orderStatus === 'Dispatched', 'Test 6: Normalizes +91 and spaces in phone number');
  } catch (err) {
    assert(false, `Test 6 Error: ${err.message}`);
  }

  // Test 7: Place a new order and immediately track it
  try {
    const newOrderPayload = {
      customer: {
        fullName: 'Kavitha Natarajan',
        mobile: '9842112345',
        email: 'kavitha@example.com',
        addressLine: '42, West Car Street, Chidambaram',
        city: 'Chidambaram',
        state: 'Tamil Nadu',
        pincode: '608001',
        deliveryNotes: 'Leave with security if not home'
      },
      items: [
        { id: 'prod-001', quantity: 2 }
      ]
    };

    const placeRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrderPayload)
    });
    const placeData = await placeRes.json();
    assert(placeRes.status === 201 && placeData.success === true, 'Test 7a: New order placed successfully');

    const createdOrderId = placeData.order.orderId;

    // Now track the newly placed order
    const trackRes = await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: createdOrderId,
        mobile: '9842112345'
      })
    });
    const trackData = await trackRes.json();
    assert(trackRes.status === 200 && trackData.success === true, 'Test 7b: Newly placed order can be tracked immediately');
    assert(trackData.order.orderStatus === 'Placed', 'Test 7c: Status of new order is Placed');
    assert(trackData.order.items[0].name.includes('Pakoda') || trackData.order.items[0].unitPrice > 0, 'Test 7d: Verified item details in tracking');
  } catch (err) {
    assert(false, `Test 7 Error: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`Summary: ${passedCount} passed, ${failedCount} failed`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
