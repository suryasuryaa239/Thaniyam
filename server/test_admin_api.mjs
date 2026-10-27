// Comprehensive automated test suite for Step 9 Admin Order Management
async function runAdminTests() {
  const BASE = 'http://127.0.0.1:5000/api/orders';
  let passed = 0;
  let failed = 0;

  function assert(cond, name) {
    if (cond) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('🧪 Starting Step 9 Admin Order Management API Verification...\n');

  // Test 1: Unauthenticated request should be rejected with 401
  try {
    const res = await fetch(`${BASE}/admin/all`);
    const data = await res.json();
    assert(res.status === 401 && data.success === false, 'Test 1: Unauthenticated access blocked with 401');
  } catch (e) {
    assert(false, `Test 1 Error: ${e.message}`);
  }

  // Test 2: Invalid admin credentials rejected
  try {
    const res = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
    });
    const data = await res.json();
    assert(res.status === 401 && data.success === false, 'Test 2: Invalid admin credentials blocked with 401');
  } catch (e) {
    assert(false, `Test 2 Error: ${e.message}`);
  }

  // Test 3: Valid admin login succeeds and provides token
  let adminToken = '';
  try {
    const res = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const data = await res.json();
    adminToken = data.token;
    assert(res.status === 200 && data.success === true && adminToken && adminToken.startsWith('th_adm_'), 'Test 3: Admin login succeeds with secure session token');
  } catch (e) {
    assert(false, `Test 3 Error: ${e.message}`);
  }

  // Test 4: Token verification endpoint
  try {
    const res = await fetch(`${BASE}/admin/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200 && data.admin?.username === 'admin', 'Test 4: Admin session verified successfully');
  } catch (e) {
    assert(false, `Test 4 Error: ${e.message}`);
  }

  // Test 5: Fetch all real customer orders with admin token
  let ordersList = [];
  try {
    const res = await fetch(`${BASE}/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    ordersList = data.orders || [];
    assert(res.status === 200 && data.success === true, 'Test 5a: Authorized fetch all orders returns 200');
    assert(Array.isArray(ordersList) && ordersList.length >= 2, 'Test 5b: Returns customer orders array with real orders');
    assert(typeof data.summary?.totalRevenue === 'number', 'Test 5c: Returns live metrics summary with totalRevenue');
  } catch (e) {
    assert(false, `Test 5 Error: ${e.message}`);
  }

  // Test 6: Search by order ID & customer mobile
  try {
    const targetOrder = ordersList[0];
    const res = await fetch(`${BASE}/admin/all?search=${encodeURIComponent(targetOrder.customer.mobile)}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200 && data.orders.some(o => o.orderId === targetOrder.orderId), 'Test 6: Search by customer mobile filters accurately');
  } catch (e) {
    assert(false, `Test 6 Error: ${e.message}`);
  }

  // Test 7: Update order status to 'Confirmed'
  const testOrderId = ordersList[0].orderId;
  const testCustomerMobile = ordersList[0].customer.mobile;
  try {
    const res = await fetch(`${BASE}/admin/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && data.order?.orderStatus === 'Confirmed', 'Test 7: Admin updates status to "Confirmed"');
  } catch (e) {
    assert(false, `Test 7 Error: ${e.message}`);
  }

  // Test 8: Update order status to 'Out for Delivery'
  try {
    const res = await fetch(`${BASE}/admin/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Out for Delivery' })
    });
    const data = await res.json();
    assert(res.status === 200 && data.order?.orderStatus === 'Out for Delivery', 'Test 8: Admin updates status to "Out for Delivery"');
  } catch (e) {
    assert(false, `Test 8 Error: ${e.message}`);
  }

  // Test 9: Immediate reflection in customer tracking endpoint
  try {
    const res = await fetch(`${BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: testOrderId, mobile: testCustomerMobile })
    });
    const data = await res.json();
    assert(res.status === 200 && data.order?.orderStatus === 'Out for Delivery', 'Test 9: Customer Order Tracking immediately reflects updated status ("Out for Delivery")');
  } catch (e) {
    assert(false, `Test 9 Error: ${e.message}`);
  }

  // Test 10: Update order status to 'Delivered'
  try {
    const res = await fetch(`${BASE}/admin/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Delivered' })
    });
    const data = await res.json();
    assert(res.status === 200 && data.order?.orderStatus === 'Delivered', 'Test 10: Admin updates status to "Delivered"');
  } catch (e) {
    assert(false, `Test 10 Error: ${e.message}`);
  }

  // Test 11: Invalid status rejected with 400
  try {
    const res = await fetch(`${BASE}/admin/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'InvalidStatusXYZ' })
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, 'Test 11: Rejects invalid status transition with 400');
  } catch (e) {
    assert(false, `Test 11 Error: ${e.message}`);
  }

  // Test 12: Admin logout
  try {
    const res = await fetch(`${BASE}/admin/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'Test 12: Admin logout succeeds');

    // Token should now be invalid
    const verifyRes = await fetch(`${BASE}/admin/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(verifyRes.status === 401, 'Test 13: Invalidated token cannot access admin routes anymore');
  } catch (e) {
    assert(false, `Logout Error: ${e.message}`);
  }

  console.log(`\n🏁 Test Run Finished. Total Passed: ${passed}, Failed: ${failed}\n`);
}

runAdminTests();
