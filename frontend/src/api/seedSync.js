import axios from 'axios';

let seedingInProgress = false;
let lastSeedAttempt = 0;

const getBaseUrl = () => {
  return (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? 'https://backend-roxiler-assignments.onrender.com/api'
      : 'http://localhost:5000/api')
  );
};

export const ensureLiveDatabaseSeeded = async () => {
  const now = Date.now();
  // Throttle to avoid multiple concurrent seeding runs
  if (seedingInProgress || now - lastSeedAttempt < 10000) {
    return false;
  }

  seedingInProgress = true;
  lastSeedAttempt = now;

  const BASE_URL = getBaseUrl();

  try {
    // 1. Admin login or signup
    let adminToken = '';
    try {
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@feedbackstore.com',
        password: 'Admin@12345'
      });
      adminToken = adminLogin.data?.token;
    } catch (err) {
      try {
        const adminSignup = await axios.post(`${BASE_URL}/auth/signup`, {
          name: 'System Administrator Master',
          email: 'admin@feedbackstore.com',
          password: 'Admin@12345',
          address: '100 Global Headquarters Blvd, Suite 500, Tech City, CA 94016',
          role: 'admin'
        });
        adminToken = adminSignup.data?.token;
      } catch (signupErr) {
        // ignore
      }
    }

    if (!adminToken) {
      seedingInProgress = false;
      return false;
    }

    // 2. Check if stores already exist
    let currentStores = [];
    try {
      const storesRes = await axios.get(`${BASE_URL}/admin/stores`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      currentStores = storesRes.data?.stores || [];
    } catch (e) {
      // ignore
    }

    // 3. Store Owners & Stores
    const sampleOwners = [
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

    for (const o of sampleOwners) {
      let ownerId = null;
      try {
        const ownerLogin = await axios.post(`${BASE_URL}/auth/login`, {
          email: o.email,
          password: o.password
        });
        ownerId = ownerLogin.data?.user?.id;
      } catch (err) {
        try {
          const ownerSignup = await axios.post(`${BASE_URL}/auth/signup`, {
            name: o.name,
            email: o.email,
            password: o.password,
            address: o.address,
            role: 'owner'
          });
          ownerId = ownerSignup.data?.user?.id;
        } catch (signupErr) {
          // ignore
        }
      }

      const storeAlreadyExists = currentStores.some(
        (s) => s.name === o.storeName || (ownerId && s.owner_id === ownerId)
      );

      if (ownerId && !storeAlreadyExists) {
        try {
          await axios.post(
            `${BASE_URL}/admin/stores`,
            {
              name: o.storeName,
              email: o.storeEmail,
              address: o.storeAddress,
              owner_id: ownerId
            },
            {
              headers: { Authorization: `Bearer ${adminToken}` }
            }
          );
        } catch (stErr) {
          // ignore
        }
      }
    }

    // 4. Normal Users
    const normalUsers = [
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
    for (const u of normalUsers) {
      try {
        const uLog = await axios.post(`${BASE_URL}/auth/login`, {
          email: u.email,
          password: u.password
        });
        if (uLog.data?.token) userTokens.push(uLog.data.token);
      } catch (e) {
        try {
          const uSign = await axios.post(`${BASE_URL}/auth/signup`, {
            name: u.name,
            email: u.email,
            password: u.password,
            address: u.address,
            role: 'user'
          });
          if (uSign.data?.token) userTokens.push(uSign.data.token);
        } catch (se) {
          // ignore
        }
      }
    }

    // 5. Public Guest Explorer
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Public Guest Explorer',
        email: 'guest.explorer@feedbackstore.com',
        password: 'Guest@12345',
        address: 'Public Portal',
        role: 'user'
      });
    } catch (ge) {
      // ignore
    }

    // 6. Submit sample ratings
    try {
      const freshStoresRes = await axios.get(`${BASE_URL}/admin/stores`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const freshStores = freshStoresRes.data?.stores || [];

      for (const st of freshStores) {
        for (let i = 0; i < userTokens.length; i++) {
          const token = userTokens[i];
          if (!token) continue;
          const val = ((st.id + i) % 3) + 3; // 3, 4, or 5
          try {
            await axios.post(
              `${BASE_URL}/user/ratings`,
              { store_id: st.id, rating: val },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (re) {
            // ignore
          }
        }
      }
    } catch (ratingErr) {
      // ignore
    }

    return true;
  } catch (err) {
    console.warn('Auto-healing error:', err.message);
    return false;
  } finally {
    seedingInProgress = false;
  }
};
