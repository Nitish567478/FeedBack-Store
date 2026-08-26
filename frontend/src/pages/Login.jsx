import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, normalizeRole } from '../context/AuthContext';
import { Store, Lock, Mail, AlertCircle, Sparkles, ArrowRight, ShieldCheck, UserCheck, User } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('session_expired');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      const userRole = normalizeRole(loggedUser.role);
      
      // Route based on role
      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/stores');
      }
    } catch (err) {
      const backendErr = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 
        'Invalid email or password';
      setError(typeof backendErr === 'string' ? backendErr : JSON.stringify(backendErr));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glow behind the card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-100 transition duration-1000"></div>

          <div className="relative glass-panel rounded-3xl p-8 shadow-2xl border border-slate-700/60">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
              <p className="text-xs text-slate-400 mt-1">
                Single sign-on access for Administrators, Store Owners & Users
              </p>
            </div>

            {sessionExpired && (
              <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Your session has expired. Please log in again.</span>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer signup link */}
            <div className="mt-5 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
                Register Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
