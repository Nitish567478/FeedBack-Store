import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Lock,
  Mail,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  ShoppingBag
} from 'lucide-react';

export const Register = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('NORMAL_USER'); // 'NORMAL_USER' or 'STORE_OWNER'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    storeEmail: '',
    storeAddress: ''
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validation rules checkers (min 3 chars required by live backend)
  const isNameLength = formData.name.trim().length >= 3 && formData.name.length <= 60;
  const isPassLength = formData.password.length >= 8 && formData.password.length <= 16;
  const isPassUpper = /[A-Z]/.test(formData.password);
  const isPassSpecial = /[!@#$%^&*]/.test(formData.password);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const isStoreNameValid = accountType === 'STORE_OWNER' ? formData.storeName.trim().length > 0 : true;
  const isStoreAddressValid = accountType === 'STORE_OWNER' ? formData.storeAddress.trim().length > 0 : true;

  const isFormValid = isNameLength && isPassLength && isPassUpper && isPassSpecial && isEmailValid && isStoreNameValid && isStoreAddressValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please make sure all required form fields are completed properly (Name must be at least 3 characters).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: accountType === 'STORE_OWNER' ? (formData.storeAddress.trim() || '') : (formData.address?.trim() || ''),
        role: accountType === 'STORE_OWNER' ? 'owner' : 'user',
        accountType
      };

      if (accountType === 'STORE_OWNER') {
        payload.storeName = formData.storeName.trim();
        payload.storeEmail = formData.storeEmail.trim() || formData.email.trim();
        payload.storeAddress = formData.storeAddress.trim();
      }

      const createdUser = await signup(payload);
      if (createdUser.role === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/stores');
      }
    } catch (err) {
      const errObj = err.response?.data?.error || err.response?.data?.message || err.response?.data?.errors;
      if (typeof errObj === 'object' && errObj !== null) {
        if (Array.isArray(errObj)) {
          setError(errObj.map(e => e.msg || e.message).join(', '));
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-20"></div>

          <div className="relative glass-panel rounded-3xl p-8 shadow-2xl border border-slate-700/60">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
              <p className="text-xs text-slate-400 mt-1">
                {accountType === 'NORMAL_USER'
                  ? 'Quick registration for shoppers & reviewers (No address required)'
                  : 'Register as a Store Owner and setup your store profile'}
              </p>
            </div>

            {/* Account Type Selector Tabs */}
            <div className="mb-6 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setAccountType('NORMAL_USER')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  accountType === 'NORMAL_USER'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Normal User</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('STORE_OWNER')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  accountType === 'STORE_OWNER'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Store Owner</span>
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Full Name <span className="text-indigo-400">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${isNameLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formData.name.length}/60 chars
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Kumar"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Store Details Section if Store Owner */}
              {accountType === 'STORE_OWNER' && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                    <span>Your Store Setup</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Store Name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      required
                      value={formData.storeName}
                      onChange={handleChange}
                      placeholder="e.g. Apex Hardware & Groceries"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Store Address <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="storeAddress"
                      required
                      value={formData.storeAddress}
                      onChange={handleChange}
                      placeholder="e.g. 742 Evergreen Terrace, Sector 4, Springfield"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Store Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="storeEmail"
                      value={formData.storeEmail}
                      onChange={handleChange}
                      placeholder="Defaults to your email if blank"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password <span className="text-indigo-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPass ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="8-16 chars, 1 uppercase, 1 special (!@#$%^&*)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Live Rule Indicators */}
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Validation Guidelines:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${isNameLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Name (2–60 characters)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isEmailValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Standard email format</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isPassLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Password 8-16 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isPassUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>At least 1 uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isPassSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Special character (!@#$%^&*)</span>
                  </div>
                  {accountType === 'STORE_OWNER' && (
                    <div className={`flex items-center gap-1.5 ${isStoreAddressValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Store Address provided</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full py-3 text-white text-sm font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  accountType === 'STORE_OWNER'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {accountType === 'STORE_OWNER'
                        ? 'Register Store Owner & Create Store'
                        : 'Create User Account & Continue'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
