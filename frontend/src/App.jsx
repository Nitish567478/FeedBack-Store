import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserStoreList } from './pages/UserStoreList';
import { OwnerDashboard } from './pages/OwnerDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<Home />} />

              {/* Public auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />

              {/* Stores Directory (Accessible to logged in users & guests) */}
              <Route path="/stores" element={<UserStoreList />} />

              {/* Admin Dashboard */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Store Owner Dashboard */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STORE_OWNER', 'ADMIN']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
