async function testAllSqliteEndpoints() {
  const BASE_URL = 'http://localhost:5000/api';

  console.log('--- Testing Local SQLite Backend (http://localhost:5000/api) ---');

  // 1. Health
  const health = await (await fetch(`${BASE_URL}/health`)).json();
  console.log('Health:', health);

  // 2. Stores list
  const stores = await (await fetch(`${BASE_URL}/stores`)).json();
  console.log(`\nFound ${stores.length} stores in database.sqlite:`);
  stores.forEach(s => {
    console.log(`- [${s.id}] ${s.name} | Rating: ${s.overallRating} (${s.totalRatings} ratings) | Owner: ${s.owner?.name}`);
  });

  // 3. Login as Admin
  const adminLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@feedbackstore.com',
      password: 'Admin@12345'
    })
  })).json();
  console.log('\nAdmin Login:', adminLogin.user?.name, 'Role:', adminLogin.user?.role);

  // 4. Admin Dashboard Stats
  const stats = await (await fetch(`${BASE_URL}/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${adminLogin.token}` }
  })).json();
  console.log('Admin Stats:', stats);

  // 5. Admin Users List
  const users = await (await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${adminLogin.token}` }
  })).json();
  console.log(`Admin Users Count: ${users.length}`);

  // 6. Login as Store Owner (kumar)
  const ownerLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tabifaw501@bocably.com',
      password: 'Owner@12345'
    })
  })).json();
  console.log('\nStore Owner Login:', ownerLogin.user?.name, 'Role:', ownerLogin.user?.role);

  // 7. Store Owner Dashboard
  if (ownerLogin.token) {
    const ownerDash = await (await fetch(`${BASE_URL}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerLogin.token}` }
    })).json();
    console.log('Owner Dashboard Store:', ownerDash.store?.name, 'Average:', ownerDash.metrics?.averageRating);
  }

  // 8. Login as Normal User (Nitish Yadav or Alexander)
  const userLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alexander.smith@example.com',
      password: 'User@12345'
    })
  })).json();
  console.log('\nNormal User Login:', userLogin.user?.name, 'Role:', userLogin.user?.role);
}

testAllSqliteEndpoints();
