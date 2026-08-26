import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { X, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const AddUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER'
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validation checks (min 3 chars required by live backend)
  const isNameValid = formData.name.trim().length >= 3 && formData.name.length <= 60;
  const isAddressValid = formData.role === 'NORMAL_USER' ? true : formData.address.trim().length > 0 && formData.address.length <= 400;
  const isPassLength = formData.password.length >= 8 && formData.password.length <= 16;
  const isPassUpper = /[A-Z]/.test(formData.password);
  const isPassSpecial = /[!@#$%^&*]/.test(formData.password);
  const isPassValid = isPassLength && isPassUpper && isPassSpecial;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const isFormValid = isNameValid && isAddressValid && isPassValid && isEmailValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isFormValid) {
      setError('Please check that all fields meet the required validation criteria (Name must be 3–60 chars).');
      return;
    }

    setLoading(true);
    try {
      const mappedRole = formData.role === 'ADMIN' ? 'admin' : (formData.role === 'STORE_OWNER' ? 'owner' : 'user');
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address?.trim() || '',
        role: mappedRole,
        accountType: formData.role
      };

      try {
        await axiosInstance.post('/admin/users', payload);
      } catch (postErr) {
        if (postErr.response?.status === 404) {
          // Fallback to /auth/signup on live backend
          await axiosInstance.post('/auth/signup', payload);
        } else {
          throw postErr;
        }
      }

      setSuccess('User created successfully!');
      if (onUserCreated) onUserCreated();
      setTimeout(() => {
        setSuccess('');
        onClose();
        setFormData({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'NORMAL_USER'
        });
      }, 1200);
    } catch (err) {
      const errObj = err.response?.data?.error || err.response?.data?.message || err.response?.data?.errors;
      if (typeof errObj === 'object' && errObj !== null) {
        if (Array.isArray(errObj)) {
          setError(errObj.map(e => e.msg || e.message).join(', '));
        } else {
          setError(Object.values(errObj).join(', '));
        }
      } else {
        setError(errObj || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New User</h3>
              <p className="text-xs text-slate-400">Add an administrator, store owner, or normal user</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name <span className="text-indigo-400">*</span>
              </label>
              <span className={`text-[11px] font-mono ${isNameValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                {formData.name.length}/60 chars
              </span>
            </div>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Kumar"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-indigo-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role <span className="text-indigo-400">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="NORMAL_USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

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
                  {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPass ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="8-16 chars, 1 Upper, 1 Special"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {formData.role !== 'NORMAL_USER' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Address <span className="text-indigo-400">*</span>
                </label>
                <span className={`text-[11px] font-mono ${formData.address.length > 0 && formData.address.length <= 400 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {formData.address.length}/400 chars
                </span>
              </div>
              <textarea
                name="address"
                rows={2}
                required={formData.role !== 'NORMAL_USER'}
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 Main Street, Suite 400, New York, NY 10001"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>
          )}

          {/* Validation summary preview */}
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
            <div className={`flex items-center gap-1.5 ${isNameValid ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Name (2–60 chars)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isEmailValid ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Valid email</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isPassValid ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Password (8-16, 1A, 1#)</span>
            </div>
            {formData.role !== 'NORMAL_USER' && (
              <div className={`flex items-center gap-1.5 ${isAddressValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Address (max 400)</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
              <span>Create User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
