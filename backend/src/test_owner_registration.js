const BASE_URL = 'https://backend-roxiler-assignments.onrender.com/api';

async function testOwnerRegistration() {
  const timestamp = Date.now();
  const ownerData = {
    name: 'Pooja Hegde Boutique Owner',
    email: `pooja.owner_${timestamp}@boutique.com`,
    password: 'Owner@12345',
    address: '77 Fashion Street, Bandra West, Mumbai',
    role: 'owner',
    accountType: 'STORE_OWNER',
    storeName: `Pooja Designer Silk Hub ${timestamp.toString().slice(-4)}`,
    storeEmail: `contact_${timestamp}@boutique.com`,
    storeAddress: '77 Fashion Street, Ground Floor, Bandra West, Mumbai 400050'
  };

  console.log('1. Registering Store Owner with Store Details...');
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: ownerData.name,
      email: ownerData.email,
      password: ownerData.password,
      address: ownerData.address,
      role: 'owner'
    })
  });
  const signupJson = await signupRes.json();
  console.log('   Owner Signup Status:', signupRes.status, 'ID:', signupJson.user?.id);

  console.log('2. Creating Store at the exact same time...');
  const storeRes = await fetch(`${BASE_URL}/admin/stores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupJson.token}`
    },
    body: JSON.stringify({
      name: ownerData.storeName,
      email: ownerData.storeEmail,
      address: ownerData.storeAddress,
      owner_id: signupJson.user.id
    })
  });
  const storeJson = await storeRes.json();
  console.log('   Store Created Status:', storeRes.status, 'Store:', storeJson.store?.name);

  console.log('3. Verifying Store appears on Public Store Directory (/stores)...');
  const guestLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'guest.explorer@feedbackstore.com', password: 'Guest@12345' })
  })).json();
  const publicStores = await (await fetch(`${BASE_URL}/user/stores`, {
    headers: { Authorization: `Bearer ${guestLogin.token}` }
  })).json();

  const foundStore = publicStores.stores?.find(s => s.name === ownerData.storeName);
  if (foundStore) {
    console.log('   ✅ SUCCESS! Store found in public directory:');
    console.log(`      ID: ${foundStore.id} | Name: ${foundStore.name} | Address: ${foundStore.address}`);
  } else {
    console.error('   ❌ FAILED! Store was not found in directory.');
  }

  console.log('4. Verifying Store appears in Owner Dashboard (/owner/dashboard)...');
  const ownerDash = await (await fetch(`${BASE_URL}/owner/dashboard`, {
    headers: { Authorization: `Bearer ${signupJson.token}` }
  })).json();
  const foundInDash = ownerDash.stores?.find(s => s.store_name === ownerData.storeName);
  if (foundInDash) {
    console.log('   ✅ SUCCESS! Store found in Owner Dashboard:');
    console.log(`      Store ID: ${foundInDash.store_id} | Name: ${foundInDash.store_name}`);
  } else {
    console.error('   ❌ FAILED! Store was not found in Owner Dashboard.');
  }
}

testOwnerRegistration().catch(console.error);
