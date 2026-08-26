import axios from 'axios';

const getBaseUrl = () => {
  return (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? 'https://backend-roxiler-assignments.onrender.com/api'
      : 'http://localhost:5000/api')
  );
};

let cachedGuestToken = sessionStorage.getItem('feedback_store_guest_token');

export const clearCachedGuestToken = () => {
  cachedGuestToken = null;
  try {
    sessionStorage.removeItem('feedback_store_guest_token');
  } catch (e) {
    // ignore
  }
};

export const getGuestToken = async () => {
  if (cachedGuestToken) {
    return cachedGuestToken;
  }

  const API_BASE_URL = getBaseUrl();

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'guest.explorer@feedbackstore.com',
      password: 'Guest@12345'
    });
    if (res.data?.token) {
      cachedGuestToken = res.data.token;
      sessionStorage.setItem('feedback_store_guest_token', cachedGuestToken);
      return cachedGuestToken;
    }
  } catch (err) {
    try {
      const signupRes = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name: 'Public Guest Explorer',
        email: `guest.explorer@feedbackstore.com`,
        password: 'Guest@12345',
        address: 'Public Portal',
        role: 'user'
      });
      if (signupRes.data?.token) {
        cachedGuestToken = signupRes.data.token;
        sessionStorage.setItem('feedback_store_guest_token', cachedGuestToken);
        return cachedGuestToken;
      }
    } catch (signupErr) {
      console.warn('Guest token acquisition failed:', signupErr.message);
    }
  }

  return cachedGuestToken || '';
};
