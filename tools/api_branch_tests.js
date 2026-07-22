const API = 'http://localhost:8080/api';
const fetch = global.fetch || require('node-fetch');

async function postOrder(order, headers={}){
  const res = await fetch(`${API}/orders`, {method:'POST', headers: { 'Content-Type':'application/json', ...headers }, body: JSON.stringify(order)});
  const text = await res.text().catch(()=>'');
  return { status: res.status, body: text };
}

async function run(){
  console.log('Running branch enforcement tests against', API);
  // Case A: user 1015 (branch 102) order with branch 101 -> expect 400
  const orderA = { user: { userId: 1015 }, branch: { branchId: 101 }, orderItems: [], orderStatus: 'PLACED', orderTime: new Date().toISOString() };
  const a = await postOrder(orderA);
  console.log('Case A (mismatch without header):', a.status, a.body.substring(0,200));

  // Case B: user 1002 (branch 101) but acting header 102, order branch 101 -> expect 403
  const orderB = { user: { userId: 1002 }, branch: { branchId: 101 }, orderItems: [], orderStatus: 'PLACED', orderTime: new Date().toISOString() };
  const b = await postOrder(orderB, { 'X-Branch-Id': '102' });
  console.log('Case B (acting header mismatch):', b.status, b.body.substring(0,200));

  // Case C: valid case user 1002 branch 101 with header 101 -> expect success (200)
  const orderC = { user: { userId: 1002 }, branch: { branchId: 101 }, orderItems: [], orderStatus: 'PLACED', orderTime: new Date().toISOString() };
  const c = await postOrder(orderC, { 'X-Branch-Id': '101' });
  console.log('Case C (valid):', c.status, c.body.substring(0,200));

  const ok = (a.status === 400) && (b.status === 403) && (c.status >=200 && c.status < 300);
  console.log('\nSummary: ', ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 2);
}

run().catch(err=>{ console.error('Error running tests', err); process.exit(3); });
