import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const UpdatePasswordModal = ({ isOpen, onClose }) => {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Validation criteria
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isValid = hasLength && hasUpper && hasSpecial && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValid) {
      setError('Please fulfill all password requirements before updating.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully! You can now use your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      const errObj = err.response?.data?.error || err.response?.data?.message || err.response?.data?.errors;
      if (typeof errObj === 'object' && errObj !== null) {
        if (Array.isArray(errObj)) {
          setError(errObj.map(e => e.msg || e.message).join(', '));
        } else {
          setError(Object.values(errObj).join(', '));
        }
      } else {
        setError(errObj || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Update Password</h3>
              <p className="text-xs text-slate-400">Ensure your account uses a secure password</p>
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
              Current Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                New Password
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
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8-16 characters with 1 uppercase & 1 special"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Real-time requirements checklist */}
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <div className={`flex items-center gap-2 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>8 to 16 characters in length</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 1 uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 1 special character (!@#$%^&*)</span>
            </div>
            <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
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
              disabled={loading || !isValid || !currentPassword}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
              <span>Save New Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
