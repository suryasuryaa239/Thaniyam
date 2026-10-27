// Comprehensive end-to-end simulation of Step 9 Flow:
// Customer places order -> Admin logs in -> Admin searches & views order -> Admin updates status -> Customer tracks order

async function runFullSimulation() {
  const BASE = 'http://127.0.0.1:5000/api/orders';

  console.log('🚀 Starting Full Step 9 End-to-End Flow Verification...\n');

  // Step 1: Customer places a real order through POST /api/orders
  console.log('1️⃣ Customer placing new traditional sweets order...');
  const orderPayload = {
    customer: {
      fullName: 'Selvam Karuppasamy',
      mobile: '9843212345',
      email: 'selvam.k@example.com',
      addressLine: '42, South Mada Street, Temple Square',
      city: 'Madurai',
      district: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625001',
      deliveryNotes: 'Ring doorbell twice please'
    },
    items: [
      {
        id: 'prod-001',
        quantity: 2
      },
      {
        id: 'prod-003',
        quantity: 1
      }
    ]
  };

  const placeRes = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  const placeData = await placeRes.json();
  if (!placeRes.ok || !placeData.success) {
    throw new Error(`Order placement failed: ${placeData.message}`);
  }

  const placedOrder = placeData.order;
  const newOrderId = placedOrder.orderId;
  console.log(`✅ Order placed successfully!`);
  console.log(`   Order ID: ${newOrderId}`);
  console.log(`   Customer: ${placedOrder.customer.fullName} (${placedOrder.customer.mobile})`);
  console.log(`   Initial Status: ${placedOrder.orderStatus}`);
  console.log(`   Total Amount: ₹${placedOrder.pricing.totalAmount}\n`);

  // Step 2: Admin authenticates
  console.log('2️⃣ Admin logging in to Admin Management Portal...');
  const loginRes = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Admin login failed: ${loginData.message}`);
  }
  const token = loginData.token;
  console.log(`✅ Admin logged in. Session token acquired: ${token.slice(0, 16)}...\n`);

  // Step 3: Admin searches for customer order
  console.log(`3️⃣ Admin querying orders with search="${newOrderId}"...`);
  const searchRes = await fetch(`${BASE}/admin/all?search=${encodeURIComponent(newOrderId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const searchData = await searchRes.json();
  const foundInAdmin = searchData.orders?.find(o => o.orderId === newOrderId);
  if (!foundInAdmin) {
    throw new Error(`Order ${newOrderId} not found in admin orders list!`);
  }
  console.log(`✅ Found order in Admin Dashboard:`);
  console.log(`   Order ID: ${foundInAdmin.orderId}`);
  console.log(`   Customer Name: ${foundInAdmin.customer.fullName}`);
  console.log(`   Items Count: ${foundInAdmin.items.length}`);
  console.log(`   Total: ₹${foundInAdmin.pricing.totalAmount}`);
  console.log(`   Status: ${foundInAdmin.orderStatus}\n`);

  // Step 4: Admin opens single order details
  console.log(`4️⃣ Admin fetching full order details for ${newOrderId}...`);
  const detailRes = await fetch(`${BASE}/admin/${newOrderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const detailData = await detailRes.json();
  const orderDetails = detailData.order;
  console.log(`✅ Full details retrieved:`);
  console.log(`   Delivery Address: ${orderDetails.customer.addressLine}, ${orderDetails.customer.city}, ${orderDetails.customer.pincode}`);
  console.log(`   Delivery Notes: "${orderDetails.customer.deliveryNotes}"`);
  console.log(`   Ordered Products:`);
  orderDetails.items.forEach((it, idx) => {
    console.log(`     ${idx + 1}. ${it.name} (${it.tamilName || ''}) - Qty: ${it.quantity} × ₹${it.unitPrice} = ₹${it.lineTotal}`);
  });
  console.log();

  // Step 5: Test all status transitions
  const testStatuses = [
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  for (const nextStatus of testStatuses) {
    console.log(`5️⃣ Admin updating status to "${nextStatus}"...`);
    const updateRes = await fetch(`${BASE}/admin/${newOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
      throw new Error(`Failed to update status to ${nextStatus}: ${updateData.message}`);
    }
    console.log(`   ✅ Admin API saved status: "${updateData.order.orderStatus}"`);

    // Verify Customer Tracking immediately reflects updated status
    const trackRes = await fetch(`${BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: newOrderId,
        mobile: '9843212345'
      })
    });
    const trackData = await trackRes.json();
    if (!trackRes.ok || !trackData.success) {
      throw new Error(`Customer tracking lookup failed for ${newOrderId}: ${trackData.message}`);
    }
    const customerSeenStatus = trackData.order.orderStatus;
    if (customerSeenStatus !== nextStatus) {
      throw new Error(`Mismatch! Customer sees "${customerSeenStatus}" but expected "${nextStatus}"`);
    }
    console.log(`   ✅ Customer Order Tracking immediately reflects: "${customerSeenStatus}"\n`);
  }

  console.log('🎉 Full End-to-End Simulation SUCCESSFUL! All 10 requirements verified.\n');
}

runFullSimulation().catch((err) => {
  console.error('❌ Simulation Error:', err.message);
  process.exit(1);
});
