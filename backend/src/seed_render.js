const BASE_URL = 'https://backend-roxiler-assignments.onrender.com/api';

async function getOrRegister(user) {
  try {
    const loginRes = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      return data;
    }
  } catch (e) {
    // try signup
  }

  const signupRes = await fetch(BASE_URL + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  const signupData = await signupRes.json();
  return signupData;
}

async function run() {
  console.log('🚀 Seeding live Render backend...');

  // 1. Admin
  const admin = await getOrRegister({
    name: 'System Administrator Master',
    email: 'admin@feedbackstore.com',
    password: 'Admin@12345',
    address: '100 Global Headquarters Blvd, Suite 500, Tech City, CA 94016',
    role: 'admin'
  });
  console.log('Admin ready:', admin.user?.email, 'ID:', admin.user?.id);

  if (!admin.token) {
    console.error('Admin token not obtained:', admin);
    return;
  }

  // 2. Owners & Stores
  const owners = [
    {
      name: 'Arthur Pendelton Store Manager',
      email: 'arthur.owner@gourmetgrocer.com',
      password: 'Owner@12345',
      address: '742 Evergreen Terrace, Sector 4, Springfield, OR 97477',
      role: 'owner',
      storeName: 'Grand Valley Gourmet Grocers',
      storeEmail: 'contact@gourmetgrocer.com',
      storeAddress: '1204 Valley Marketplace Highway, Suite A, Seattle, WA 98101'
    },
    {
      name: 'Beatrix Kiddo Retail Director',
      email: 'beatrix.owner@cyberhub.com',
      password: 'Owner@12345',
      address: '88 Cyberpunk Arcade Way, Neo Tokyo District, WA 98101',
      role: 'owner',
      storeName: 'Cybernetics Electronics Hub',
      storeEmail: 'support@cyberhub.com',
      storeAddress: '404 Silicon Boulevard, Downtown Tech Square, San Jose, CA 95113'
    },
    {
      name: 'Charles Montgomery Burns Jr',
      email: 'charles.owner@bookvault.com',
      password: 'Owner@12345',
      address: '1000 Luxury Estates Avenue, Penthouse B, NY 10021',
      role: 'owner',
      storeName: 'The Vintage Bookstore & Cafe',
      storeEmail: 'hello@bookvault.com',
      storeAddress: '221B Baker Street Quarter, Old Town, Boston, MA 02108'
    },
    {
      name: 'kumar store owner',
      email: 'tabifaw501@bocably.com',
      password: 'Owner@12345',
      address: '123 Market Street, Suite 101, New York, NY 10001',
      role: 'owner',
      storeName: 'kumar store',
      storeEmail: 'store.tabifaw501@bocably.com',
      storeAddress: '123 Market Street, Suite 101, New York, NY 10001'
    }
  ];

  const currentStoresRes = await fetch(BASE_URL + '/admin/stores', {
    headers: { Authorization: 'Bearer ' + admin.token }
  });
  const currentStoresData = await currentStoresRes.json();
  const existingStoreList = currentStoresData.stores || [];

  for (const o of owners) {
    const ownerAcc = await getOrRegister({
      name: o.name,
      email: o.email,
      password: o.password,
      address: o.address,
      role: 'owner'
    });
    console.log('Owner ready:', ownerAcc.user?.email, 'ID:', ownerAcc.user?.id);

    const exists = existingStoreList.find(s => s.name === o.storeName || s.owner_id === ownerAcc.user?.id);
    if (!exists && ownerAcc.user?.id) {
      const createStoreRes = await fetch(BASE_URL + '/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + admin.token
        },
        body: JSON.stringify({
          name: o.storeName,
          email: o.storeEmail,
          address: o.storeAddress,
          owner_id: ownerAcc.user?.id
        })
      });
      const stData = await createStoreRes.json();
      console.log('Created store for', o.storeName, '=>', stData);
    } else {
      console.log('Store already exists or owner ID missing:', o.storeName);
    }
  }

  // 3. Normal Users
  const users = [
    {
      name: 'Alexander Hamilton Smithson',
      email: 'alexander.smith@example.com',
      password: 'User@12345',
      address: '350 Fifth Avenue, Floor 14, Manhattan, NY 10118',
      role: 'user'
    },
    {
      name: 'Benjamin Franklin Rodriguez',
      email: 'benjamin.rodriguez@example.com',
      password: 'User@12345',
      address: '1776 Liberty Bell Way, Historic Quarter, Philadelphia, PA 19106',
      role: 'user'
    },
    {
      name: 'Catherine Elizabeth Middleton',
      email: 'catherine.middleton@example.com',
      password: 'User@12345',
      address: '45 Kensington Palace Gardens, Royal District, London, UK',
      role: 'user'
    },
    {
      name: 'David Jonathan Copperfield',
      email: 'david.copperfield@example.com',
      password: 'User@12345',
      address: '77 Magic Mountain Road, North Ridge, Denver, CO 80202',
      role: 'user'
    }
  ];

  const userTokens = [];
  for (const u of users) {
    const userAcc = await getOrRegister(u);
    if (userAcc.token) {
      userTokens.push({ ...userAcc, email: u.email });
      console.log('User ready:', userAcc.user?.email, 'ID:', userAcc.user?.id);
    }
  }

  // 4. Guest account
  await getOrRegister({
    name: 'Public Guest Explorer',
    email: 'guest.explorer@feedbackstore.com',
    password: 'Guest@12345',
    address: 'Public Portal',
    role: 'user'
  });

  // 5. Fetch updated store list
  const updatedStoresRes = await fetch(BASE_URL + '/admin/stores', {
    headers: { Authorization: 'Bearer ' + admin.token }
  });
  const updatedStores = (await updatedStoresRes.json()).stores || [];
  console.log('\n--- Current Stores in Render DB (' + updatedStores.length + ' stores) ---');
  console.log(updatedStores);

  // 6. Submit sample ratings
  for (const st of updatedStores) {
    for (let i = 0; i < userTokens.length; i++) {
      const u = userTokens[i];
      const ratingVal = ((st.id + i) % 3) + 3; // 3, 4, 5
      try {
        const rateRes = await fetch(BASE_URL + '/user/ratings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + u.token
          },
          body: JSON.stringify({
            store_id: st.id,
            rating: ratingVal
          })
        });
        const rData = await rateRes.json();
        console.log(`Rating store ${st.name} (id:${st.id}) by ${u.email} -> ${ratingVal} stars [${rateRes.status}]`);
      } catch (err) {
        console.warn('Rating submission error:', err.message);
      }
    }
  }

  console.log('\n🎉 ALL SEED DATA SUCCESSFULLY SYNCED TO RENDER!');
}

run().catch(console.error);
