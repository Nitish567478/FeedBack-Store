import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { X, Store, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

export const AddStoreModal = ({ isOpen, onClose, onStoreCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [availableOwners, setAvailableOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEligibleOwners();
    }
  }, [isOpen]);

  const fetchEligibleOwners = async () => {
    setLoadingOwners(true);
    try {
      // Get all users to find potential owners (users without a store or STORE_OWNERs)
      const res = await axiosInstance.get('/admin/users');
      const rawUsers = res.data?.users || (Array.isArray(res.data) ? res.data : []);
      // Filter users who do not already own a store or are owners
      const eligible = rawUsers.filter(u => {
        const role = String(u.role || '').toUpperCase();
        return role === 'STORE_OWNER' || role === 'OWNER' || (!u.storeInfo && !u.store && role !== 'ADMIN');
      });
      setAvailableOwners(eligible.length > 0 ? eligible : rawUsers);
      if (eligible.length > 0) {
        setFormData(prev => ({ ...prev, ownerId: eligible[0].id }));
      } else if (rawUsers.length > 0) {
        setFormData(prev => ({ ...prev, ownerId: rawUsers[0].id }));
      }
    } catch (err) {
      console.error('Failed to load eligible store owners:', err);
    } finally {
      setLoadingOwners(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isNameValid = formData.name.trim().length >= 3 && formData.name.length <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isOwnerValid = !!formData.ownerId;
  const isFormValid = isNameValid && isAddressValid && isEmailValid && isOwnerValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isFormValid) {
      setError('Please fill in all required fields properly (Store Name must be between 3 and 60 characters).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        owner_id: Number(formData.ownerId) || formData.ownerId,
        ownerId: formData.ownerId
      };

      await axiosInstance.post('/admin/stores', payload);
      setSuccess('Store created and owner assigned successfully!');
      if (onStoreCreated) onStoreCreated();
      setTimeout(() => {
        setSuccess('');
        onClose();
        setFormData({
          name: '',
          email: '',
          address: '',
          ownerId: ''
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
        setError(errObj || 'Failed to create store');
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
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add New Store</h3>
              <p className="text-xs text-slate-400">Register a store location and assign an owner</p>
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Store Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apex Hardware & Gadgets"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Store Email <span className="text-indigo-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@apexstore.com"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Store Owner User <span className="text-indigo-400">*</span>
              </label>
              {loadingOwners && <span className="text-[11px] text-slate-400">Loading users...</span>}
            </div>
            {availableOwners.length === 0 && !loadingOwners ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <UserCheck className="w-4 h-4 flex-shrink-0" />
                <span>No available unassigned users found. Please create a user first before creating a store.</span>
              </div>
            ) : (
              <select
                name="ownerId"
                required
                value={formData.ownerId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              >
                <option value="" disabled>Select a user to assign as owner</option>
                {availableOwners.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - {u.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Store Address <span className="text-indigo-400">*</span>
              </label>
              <span className={`text-[11px] font-mono ${formData.address.length > 0 && formData.address.length <= 400 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {formData.address.length}/400 chars
              </span>
            </div>
            <textarea
              name="address"
              rows={2}
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 500 Market Square Plaza, Building B, Seattle, WA"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
            />
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
              <span>Create Store</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
