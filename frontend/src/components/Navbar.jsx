import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, normalizeRole } from '../context/AuthContext';
import { UpdatePasswordModal } from './UpdatePasswordModal';
import {
  Store,
  ShieldCheck,
  User,
  KeyRound,
  LogOut,
  LayoutDashboard,
  Layers,
  ChevronDown,
  Home as HomeIcon
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = user ? normalizeRole(user.role) : null;

  const getRoleBadge = () => {
    if (!user) return null;
    switch (userRole) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Store className="w-3.5 h-3.5" />
            Store Owner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <User className="w-3.5 h-3.5" />
            User
          </span>
        );
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation Links */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                    FeedBack<span className="text-indigo-400">Store</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 -mt-1 font-medium">
                    Rating & Directory
                  </span>
                </div>
              </Link>

              {/* Navigation links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname === '/'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <HomeIcon className="w-3.5 h-3.5" />
                  Home
                </Link>

                <Link
                  to="/stores"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname === '/stores'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Browse Stores
                </Link>

                {isAuthenticated && userRole === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin Dashboard
                  </Link>
                )}

                {isAuthenticated && userRole === 'STORE_OWNER' && (
                  <Link
                    to="/owner/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      location.pathname.startsWith('/owner')
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    My Store Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* Right side auth & profile */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 text-left transition focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className="text-xs font-semibold text-white max-w-[140px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 max-w-[140px] truncate">
                        {user.email}
                      </span>
                    </div>
                    {getRoleBadge()}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-800">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2">{getRoleBadge()}</div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setIsPassModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                        >
                          <KeyRound className="w-4 h-4 text-indigo-400" />
                          Update Password
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Password update modal */}
      <UpdatePasswordModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
      />
    </>
  );
};
