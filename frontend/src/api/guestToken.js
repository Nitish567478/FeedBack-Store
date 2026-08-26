import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-roxiler-assignments.onrender.com/api';

// Pre-seeded fallback guest token for public read-only store catalog access
let cachedGuestToken =
  sessionStorage.getItem('feedback_store_guest_token') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibmFtZSI6IlB1YmxpYyBHdWVzdCBFeHBsb3JlciIsImVtYWlsIjoiZ3Vlc3QuZXhwbG9yZXJAZmVlZGJhY2tzdG9yZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc4NzcyOTg4NywiZXhwIjoxNzg4MzM0Njg3fQ.ftW7RJFU_JLgNKDD0itql6Z2h23Glxqa-kHs5JmxRt8';

export const getGuestToken = async () => {
  if (cachedGuestToken) {
    return cachedGuestToken;
  }

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
        email: `guest_${Date.now().toString().slice(-4)}@feedbackstore.com`,
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

  return cachedGuestToken;
};
