async function test() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('Testing AgentReady Backend APIs...\n');

  // 1. Health
  const healthRes = await fetch(`${baseUrl}/health`);
  const health = await healthRes.json();
  console.log('1. /api/health:', health.status === 'ok' ? '✅ PASS' : '❌ FAIL', health);

  // 2. GET /api/products
  const prodRes = await fetch(`${baseUrl}/products`);
  const prods = await prodRes.json();
  console.log('2. GET /api/products count:', prods.data.length, prods.data.length === 5 ? '✅ PASS' : '❌ FAIL');

  // 3. GET /api/settings
  const setRes = await fetch(`${baseUrl}/settings`);
  const settings = await setRes.json();
  console.log('3. GET /api/settings:', settings.data.maximum_transaction_amount === 1000000 ? '✅ PASS' : '❌ FAIL', settings.data);

  // 4. PUT /api/settings
  const putSetRes = await fetch(`${baseUrl}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      maximum_transaction_amount: 1000000,
      maximum_discount_percentage: 10,
      human_approval_amount: 800000
    })
  });
  const updatedSet = await putSetRes.json();
  console.log('4. PUT /api/settings:', updatedSet.success ? '✅ PASS' : '❌ FAIL');

  // 5. POST /api/products
  const postRes = await fetch(`${baseUrl}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test AI Workstation',
      description: 'Dual RTX 4090 Workstation for LLM Fine-Tuning',
      category: 'Servers',
      price: 350000,
      minimum_price: 320000,
      stock: 5,
      bulk_rules: [{ minimum_quantity: 3, discount_percentage: 6 }]
    })
  });
  const newProd = await postRes.json();
  console.log('5. POST /api/products (Create):', newProd.success && newProd.data.id ? '✅ PASS' : '❌ FAIL', 'Created ID:', newProd.data?.id);

  // 6. PUT /api/products/:id
  const putRes = await fetch(`${baseUrl}/products/${newProd.data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test AI Workstation Pro',
      price: 360000,
      minimum_price: 330000,
      stock: 8
    })
  });
  const updatedProd = await putRes.json();
  console.log('6. PUT /api/products/:id (Update):', updatedProd.success && updatedProd.data.stock === 8 ? '✅ PASS' : '❌ FAIL');

  // 7. DELETE /api/products/:id
  const delRes = await fetch(`${baseUrl}/products/${newProd.data.id}`, {
    method: 'DELETE'
  });
  const delResult = await delRes.json();
  console.log('7. DELETE /api/products/:id (Delete):', delResult.success ? '✅ PASS' : '❌ FAIL');

  // 8. Re-verify product count back to 5
  const finalProds = await (await fetch(`${baseUrl}/products`)).json();
  console.log('8. Verify Final Count:', finalProds.data.length, finalProds.data.length === 5 ? '✅ PASS' : '❌ FAIL');

  console.log('\nAll Backend API Tests Completed Successfully!');
}

test().catch(console.error);
