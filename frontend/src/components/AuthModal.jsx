import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StarRating } from './StarRating';
import {
  X,
  Lock,
  Mail,
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  ShieldCheck,
  Store
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, targetStore, pendingRating, onRatingComplete }) => {
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Validation checkers for signup
  const isNameLength = signupName.trim().length >= 3 && signupName.trim().length <= 60;
  const isPassLength = signupPassword.length >= 8 && signupPassword.length <= 16;
  const isPassUpper = /[A-Z]/.test(signupPassword);
  const isPassSpecial = /[!@#$%^&*]/.test(signupPassword);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail);
  const isSignupValid = isNameLength && isPassLength && isPassUpper && isPassSpecial && isEmailValid;

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setSuccess('Signed in successfully! Submitting your rating...');
      
      if (onRatingComplete && targetStore) {
        await onRatingComplete(targetStore.id, pendingRating || 5);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
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

  const handleSignupSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (!isSignupValid) {
      setError('Please ensure all required fields are filled correctly (Name min 3 chars, strong password).');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        address: signupAddress.trim() || 'Community Member',
        role: 'user',
        accountType: 'NORMAL_USER'
      });

      setSuccess('Account created successfully! Submitting your rating...');

      if (onRatingComplete && targetStore) {
        await onRatingComplete(targetStore.id, pendingRating || 5);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errObj = err.response?.data?.error || err.response?.data?.message || err.response?.data?.errors;
      if (typeof errObj === 'object' && errObj !== null) {
        if (Array.isArray(errObj)) {
          setError(errObj.map((e) => e.msg || e.message).join(', '));
        } else {
          setError(Object.values(errObj).join(', '));
        }
      } else {
        setError(errObj || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setLoginEmail('alexander.smith@example.com');
    setLoginPassword('User@12345');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Sign In to Rate</h3>
              <p className="text-xs text-slate-400">
                Rate & give feedback on{' '}
                <span className="text-indigo-400 font-semibold">"{targetStore?.name || 'this Store'}"</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Rating Banner */}
        {pendingRating > 0 && (
          <div className="px-6 py-2.5 bg-indigo-950/40 border-b border-indigo-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Selected Score:</span>
            <div className="flex items-center gap-2">
              <StarRating currentRating={pendingRating} readOnly size="sm" />
              <span className="text-xs font-bold text-amber-400 font-mono">
                {pendingRating} / 5 Stars
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
          {/* Tab buttons */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>

          {/* Feedback message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* LOGIN TAB */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={fillQuickDemo}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Quick 1-Click Demo Fill
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !loginEmail || !loginPassword}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In & Record Rating</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGNUP TAB */
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name (3–60 Characters)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Johnathan Doe"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password (8–16 chars, 1 uppercase, 1 special)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="e.g. Password@123"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    placeholder="e.g. 123 Main Street"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isSignupValid}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account & Submit Rating</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
