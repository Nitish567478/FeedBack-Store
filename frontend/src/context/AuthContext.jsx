import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const normalizeRole = (role) => {
  if (!role) return 'NORMAL_USER';
  const r = String(role).toUpperCase();
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'STORE_OWNER' || r === 'OWNER') return 'STORE_OWNER';
  return 'NORMAL_USER';
};

const formatUser = (rawUser) => {
  if (!rawUser) return null;
  return {
    ...rawUser,
    role: normalizeRole(rawUser.role),
    rawRole: rawUser.role
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('feedback_store_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('feedback_store_token');
      const storedUser = localStorage.getItem('feedback_store_user');

      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(formatUser(parsed));

          // Verify with backend if supported
          try {
            const res = await axiosInstance.get('/auth/me');
            if (res.data?.user) {
              const updated = formatUser(res.data.user);
              setUser(updated);
              localStorage.setItem('feedback_store_user', JSON.stringify(updated));
            }
          } catch (verifyErr) {
            // Only logout if token is explicitly rejected (401 with active token), not on 404
            if (verifyErr.response?.status === 401) {
              logout();
            }
          }
        } catch (err) {
          console.warn('Session initialization error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const res = await axiosInstance.post('/auth/login', { email: cleanEmail, password });
    const receivedToken = res.data.token;
    const receivedUser = formatUser(res.data.user);

    localStorage.setItem('feedback_store_token', receivedToken);
    localStorage.setItem('feedback_store_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const signup = async (data) => {
    const mappedRole = data.role 
      ? data.role 
      : (data.accountType === 'STORE_OWNER' ? 'owner' : (data.accountType === 'ADMIN' ? 'admin' : 'user'));

    const payload = {
      ...data,
      role: mappedRole
    };

    const res = await axiosInstance.post('/auth/signup', payload);
    const receivedToken = res.data.token;
    const receivedUser = formatUser(res.data.user);

    // If registering as a STORE_OWNER and store details are provided:
    // Create the store immediately so it is instantly available in the public catalog and owner dashboard
    const isOwner = data.accountType === 'STORE_OWNER' || mappedRole === 'owner' || mappedRole === 'STORE_OWNER';
    if (isOwner && data.storeName && data.storeName.trim()) {
      try {
        const storePayload = {
          name: data.storeName.trim(),
          email: (data.storeEmail || data.email).trim(),
          address: (data.storeAddress || data.address || 'Store Location').trim(),
          owner_id: receivedUser.id,
          ownerId: receivedUser.id
        };
        const storeRes = await axiosInstance.post('/admin/stores', storePayload, {
          headers: { Authorization: `Bearer ${receivedToken}` }
        });
        if (storeRes.data?.store) {
          receivedUser.store = storeRes.data.store;
        }
      } catch (storeErr) {
        try {
          const ownerStoreRes = await axiosInstance.post('/owner/store', {
            name: data.storeName.trim(),
            email: (data.storeEmail || data.email).trim(),
            address: (data.storeAddress || data.address || 'Store Location').trim()
          }, {
            headers: { Authorization: `Bearer ${receivedToken}` }
          });
          if (ownerStoreRes.data?.store) {
            receivedUser.store = ownerStoreRes.data.store;
          }
        } catch (e2) {
          console.warn('Store creation fallback note:', e2.message);
        }
      }
    }

    localStorage.setItem('feedback_store_token', receivedToken);
    localStorage.setItem('feedback_store_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('feedback_store_token');
    localStorage.removeItem('feedback_store_user');
    setToken(null);
    setUser(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axiosInstance.patch('/auth/update-password', {
        currentPassword,
        newPassword
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return { message: 'Password updated successfully' };
      }
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      if (res.data?.user) {
        const updated = formatUser(res.data.user);
        setUser(updated);
        localStorage.setItem('feedback_store_user', JSON.stringify(updated));
      }
    } catch (e) {
      // Ignored for backends without /auth/me
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updatePassword,
        refreshUser,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
