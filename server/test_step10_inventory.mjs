// Comprehensive Automated Test Suite for Step 10 — Product & Inventory Management
const BASE = 'http://127.0.0.1:5000/api';

async function runInventoryTests() {
  console.log('🧪 Starting Step 10 Product & Inventory Management Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Public catalog endpoint
    const pubRes = await fetch(`${BASE}/products`);
    const pubData = await pubRes.json();
    assert(pubRes.ok && pubData.success && pubData.count >= 18, `Public /api/products returns active catalogue (${pubData.count} items)`);
    assert(typeof pubData.products[0].stock === 'number', 'Products contain numeric stock quantities');

    // 2. Public single product
    const singleRes = await fetch(`${BASE}/products/prod-001`);
    const singleData = await singleRes.json();
    assert(singleRes.ok && singleData.product?.id === 'prod-001', 'Public /api/products/:id returns single product');

    // 3. Admin Authentication
    const loginRes = await fetch(`${BASE}/orders/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(loginRes.ok && token, 'Admin authenticates and acquires session token');

    // 4. Admin inventory list & stats
    const adminProdRes = await fetch(`${BASE}/products/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const adminProdData = await adminProdRes.json();
    assert(adminProdRes.ok && adminProdData.stats?.totalProducts >= 18, 'Admin retrieves inventory stats and all products');
    assert(adminProdData.stats?.totalStockUnits > 0, `Admin stats include total inventory units (${adminProdData.stats?.totalStockUnits})`);

    // 5. Validation when creating product (negative stock or invalid price)
    const invalidRes = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'A',
        price: -50,
        stock: -5,
        category: 'traditional-snacks'
      })
    });
    assert(invalidRes.status === 400, 'Creation rejects invalid product name/price/stock with 400 Bad Request');

    // 6. Admin creates a new product
    const createRes = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Tirunelveli Karupatti Nei Halwa',
        tamilName: 'திருநெல்வேலி கருப்பட்டி நெய் அல்வா',
        category: 'millet-sweets',
        categoryName: 'Millet Sweets',
        price: 210,
        originalPrice: 240,
        weight: '250g',
        stock: 10,
        badge: 'Traditional Ghee',
        image: '/images/prod-laddu.jpg',
        description: 'Authentic palm jaggery wheat halwa cooked in pure cow ghee.'
      })
    });
    const createData = await createRes.json();
    const newProduct = createData.product;
    assert(createRes.status === 201 && newProduct?.id, `New product created successfully: ${newProduct?.id} with stock ${newProduct?.stock}`);

    // 7. Admin updates product details and price
    const updateRes = await fetch(`${BASE}/products/${newProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        price: 210,
        stock: 4 // Set stock to 4 for testing limited inventory
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.ok && updateData.product?.stock === 4, `Product updated: price ₹${updateData.product?.price}, stock ${updateData.product?.stock}`);

    // 8. Admin quick adjust stock via PATCH
    const patchStockRes = await fetch(`${BASE}/products/${newProduct.id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ delta: -1 })
    });
    const patchStockData = await patchStockRes.json();
    assert(patchStockRes.ok && patchStockData.product?.stock === 3, `Quick stock adjust: 4 - 1 = ${patchStockData.product?.stock} units`);

    // 9. Customer attempts to order MORE units than available in stock (stock is 3, requests 5)
    const excessOrderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          fullName: 'Senthil Kumar',
          mobile: '9840112233',
          addressLine: '12, Bazaar Street',
          city: 'Tirunelveli',
          state: 'Tamil Nadu',
          pincode: '627001'
        },
        items: [{ id: newProduct.id, quantity: 5 }]
      })
    });
    const excessData = await excessOrderRes.json();
    assert(excessOrderRes.status === 400 && excessData.message.includes('Insufficient stock'), 'Order placement rejected with 400 when quantity exceeds available stock');

    // 10. Customer orders valid quantity (requests 2 out of 3 available units)
    const validOrderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          fullName: 'Senthil Kumar',
          mobile: '9840112233',
          addressLine: '12, Bazaar Street',
          city: 'Tirunelveli',
          state: 'Tamil Nadu',
          pincode: '627001'
        },
        items: [{ id: newProduct.id, quantity: 2 }]
      })
    });
    const validOrderData = await validOrderRes.json();
    const placedOrderId = validOrderData.order?.orderId;
    assert(validOrderRes.status === 201 && placedOrderId, `Order placed successfully: ${placedOrderId}`);

    // Verify stock was reduced from 3 to 1
    const checkStockRes = await fetch(`${BASE}/products/${newProduct.id}`);
    const checkStockData = await checkStockRes.json();
    assert(checkStockData.product?.stock === 1, `Inventory atomically deducted: Stock is now ${checkStockData.product?.stock} (was 3)`);

    // 11. Customer orders the final 1 unit -> stock reaches 0 (Out of Stock)
    const finalOrderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          fullName: 'Kavitha Raja',
          mobile: '9840998877',
          addressLine: '45, Anna Nagar',
          city: 'Madurai',
          state: 'Tamil Nadu',
          pincode: '625020'
        },
        items: [{ id: newProduct.id, quantity: 1 }]
      })
    });
    assert(finalOrderRes.status === 201, 'Order for last unit placed successfully');

    // Verify product is now marked out-of-stock
    const outOfStockRes = await fetch(`${BASE}/products/${newProduct.id}`);
    const outOfStockData = await outOfStockRes.json();
    assert(outOfStockData.product?.stock === 0 && outOfStockData.product?.inStock === false, 'Product correctly reflects Out of Stock (stock: 0, inStock: false)');

    // 12. Attempt to purchase out-of-stock product -> REJECTED
    const rejectSoldOutRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          fullName: 'Ramesh Babu',
          mobile: '9840554433',
          addressLine: '88, North Car Street',
          city: 'Salem',
          state: 'Tamil Nadu',
          pincode: '636001'
        },
        items: [{ id: newProduct.id, quantity: 1 }]
      })
    });
    assert(rejectSoldOutRes.status === 400, 'Attempt to purchase Out of Stock product is rejected with 400');

    // 13. Order cancellation restores inventory stock
    const cancelRes = await fetch(`${BASE}/orders/admin/${placedOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert(cancelRes.ok, `Admin cancelled order ${placedOrderId}`);

    const restoredCheckRes = await fetch(`${BASE}/products/${newProduct.id}`);
    const restoredCheckData = await restoredCheckRes.json();
    assert(restoredCheckData.product?.stock === 2 && restoredCheckData.product?.inStock === true, `Inventory restored upon cancellation: Stock is now ${restoredCheckData.product?.stock}`);

    // 14. Safe Deactivation: Attempting to delete a product that has existing customer orders
    const deleteRes = await fetch(`${BASE}/products/${newProduct.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.ok && deleteData.action === 'deactivated', 'Product with order history is safely DEACTIVATED rather than broken');

    // Verify existing order tracking is still 100% intact!
    const trackRes = await fetch(`${BASE}/orders/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: placedOrderId,
        mobile: '9840112233'
      })
    });
    const trackData = await trackRes.json();
    assert(trackRes.ok && trackData.order?.orderId === placedOrderId, 'Past customer order tracking remains 100% intact after product deactivation');

    // 15. Product without order history can be cleanly deleted
    const tempProdRes = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Temporary Item',
        category: 'traditional-snacks',
        price: 99,
        stock: 10
      })
    });
    const tempProd = (await tempProdRes.json()).product;
    const cleanDeleteRes = await fetch(`${BASE}/products/${tempProd.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const cleanDeleteData = await cleanDeleteRes.json();
    assert(cleanDeleteRes.ok && cleanDeleteData.action === 'deleted', 'Unused product is permanently deleted');

  } catch (err) {
    console.error('💥 Test execution error:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runInventoryTests();
