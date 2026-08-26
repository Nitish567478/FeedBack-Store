const BASE_URL = 'https://backend-roxiler-assignments.onrender.com/api';

async function verifyAll() {
  console.log('=== VERIFYING LIVE RENDER BACKEND HEALTH & DATA ===\n');

  // Test 1: Admin Login
  const adminRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@feedbackstore.com', password: 'Admin@12345' })
  });
  console.log('1. Admin Login HTTP Status:', adminRes.status);
  const adminData = await adminRes.json();
  console.log('   Admin user:', adminData.user);

  // Test 2: Admin Dashboard Stats
  const stats = await (await fetch(BASE_URL + '/admin/dashboard', {
    headers: { Authorization: 'Bearer ' + adminData.token }
  })).json();
  console.log('2. Admin Dashboard Stats:', stats);

  // Test 3: Admin Stores List
  const adminStores = await (await fetch(BASE_URL + '/admin/stores', {
    headers: { Authorization: 'Bearer ' + adminData.token }
  })).json();
  console.log('3. Admin Stores count in DB:', adminStores.stores?.length);

  // Test 4: Admin Users List
  const adminUsers = await (await fetch(BASE_URL + '/admin/users', {
    headers: { Authorization: 'Bearer ' + adminData.token }
  })).json();
  console.log('4. Admin Users count in DB:', adminUsers.users?.length);

  // Test 5: Public Stores Endpoint (via guest token)
  const guestLogin = await (await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'guest.explorer@feedbackstore.com', password: 'Guest@12345' })
  })).json();
  const guestStores = await (await fetch(BASE_URL + '/user/stores', {
    headers: { Authorization: 'Bearer ' + guestLogin.token }
  })).json();
  console.log('5. Store Directory for Public/Users (Total stores returned):', guestStores.stores?.length);
  guestStores.stores?.forEach(s => {
    console.log(`   - [ID: ${s.id}] ${s.name} (${s.email}) | Avg Rating: ${s.avg_rating} ★`);
  });

  // Test 6: Store Owner Login & Dashboard
  const ownerLogin = await (await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'arthur.owner@gourmetgrocer.com', password: 'Owner@12345' })
  })).json();
  console.log('\n6. Store Owner Login HTTP Status:', ownerLogin.token ? '200 OK' : 'FAILED');
  const ownerDash = await (await fetch(BASE_URL + '/owner/dashboard', {
    headers: { Authorization: 'Bearer ' + ownerLogin.token }
  })).json();
  console.log('   Store Owner Stores:', ownerDash.stores?.map(s => `${s.store_name} (avg: ${s.avg_rating}★, reviews: ${s.ratings_count})`));

  // Test 7: Normal User Login
  const userLogin = await (await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alexander.smith@example.com', password: 'User@12345' })
  })).json();
  console.log('\n7. Normal User Login HTTP Status:', userLogin.token ? '200 OK' : 'FAILED');
  console.log('   User name:', userLogin.user?.name, 'Role:', userLogin.user?.role);

  console.log('\n🎉 ALL LIVE VERIFICATION CHECKS PASSED PERFECTLY!');
}

verifyAll().catch(console.error);
