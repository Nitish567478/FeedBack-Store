import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { StarRating } from '../components/StarRating';
import { AddUserModal } from '../components/AddUserModal';
import { AddStoreModal } from '../components/AddStoreModal';
import {
  Users,
  Store,
  Star,
  UserPlus,
  Store as StoreIcon,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    rolesBreakdown: { ADMIN: 0, NORMAL_USER: 0, STORE_OWNER: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Active tab: 'users' or 'stores'
  const [activeTab, setActiveTab] = useState('users');

  // Users table state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState('desc');

  // Stores table state
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('createdAt');
  const [storeSortOrder, setStoreSortOrder] = useState('desc');

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, userSearch, userRoleFilter, userSortBy, userSortOrder, storeSearch, storeSortBy, storeSortOrder]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      let res;
      try {
        res = await axiosInstance.get('/admin/dashboard');
      } catch (e) {
        if (e.response?.status === 404) {
          res = await axiosInstance.get('/admin/dashboard-stats');
        } else {
          throw e;
        }
      }
      const raw = res.data || {};
      setStats({
        totalUsers: raw.totalUsers ?? raw.users_count ?? 0,
        totalStores: raw.totalStores ?? raw.stores_count ?? 0,
        totalRatings: raw.totalRatings ?? raw.ratings_count ?? 0,
        rolesBreakdown: raw.rolesBreakdown || { ADMIN: 0, NORMAL_USER: 0, STORE_OWNER: 0 }
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = {
        sortBy: userSortBy,
        sort_by: userSortBy,
        order: userSortOrder,
        sort_order: userSortOrder.toUpperCase()
      };
      if (userSearch && userSearch.trim()) {
        params.search = userSearch.trim();
        params.name = userSearch.trim();
      }
      if (userRoleFilter) {
        params.role = userRoleFilter.toLowerCase();
      }

      const res = await axiosInstance.get('/admin/users', { params });
      const rawUsers = res.data?.users || (Array.isArray(res.data) ? res.data : []);
      setUsers(rawUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const sortField = storeSortBy === 'rating' || storeSortBy === 'overallRating' ? 'avg_rating' : storeSortBy;
      const params = {
        sortBy: storeSortBy,
        sort_by: sortField,
        order: storeSortOrder,
        sort_order: storeSortOrder.toUpperCase()
      };
      if (storeSearch && storeSearch.trim()) {
        params.search = storeSearch.trim();
        params.name = storeSearch.trim();
      }

      const res = await axiosInstance.get('/admin/stores', { params });
      const rawStores = res.data?.stores || (Array.isArray(res.data) ? res.data : []);
      const mappedStores = rawStores.map(s => {
        const avg = s.avg_rating !== undefined ? s.avg_rating : (s.averageRating !== undefined ? s.averageRating : 0);
        const avgNum = typeof avg === 'number' ? avg : parseFloat(avg || 0);
        return {
          ...s,
          averageRating: avgNum,
          totalRatings: s.ratings_count ?? s.totalRatings ?? (avgNum > 0 ? 1 : 0)
        };
      });
      setStores(mappedStores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  const renderSortIcon = (currentSortBy, currentSortOrder, field) => {
    if (currentSortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />;
    }
    return currentSortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
    );
  };

  const getRoleBadge = (role) => {
    const r = String(role || '').toUpperCase();
    if (r === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Admin
        </span>
      );
    }
    if (r === 'STORE_OWNER' || r === 'OWNER') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Store Owner
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        Normal User
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">System Administration</h1>
              <p className="text-xs text-slate-400">Platform overview, metrics and RBAC user directory</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setIsAddStoreOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total Users */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {loadingStats ? '...' : stats.totalUsers}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span>{stats.rolesBreakdown?.NORMAL_USER || 0} Normal</span>
                <span>•</span>
                <span>{stats.rolesBreakdown?.STORE_OWNER || 0} Owners</span>
                <span>•</span>
                <span>{stats.rolesBreakdown?.ADMIN || 0} Admin</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Stores */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Stores</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {loadingStats ? '...' : stats.totalStores}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2">Active registered storefronts</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <StoreIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ratings</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {loadingStats ? '...' : stats.totalRatings}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2">1 to 5 star user reviews recorded</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Tabs + Directory Tables */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 px-6 py-4 gap-4 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Directory</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px]">
                {users.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'stores'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <StoreIcon className="w-4 h-4" />
              <span>Stores Directory</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px]">
                {stores.length}
              </span>
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              fetchStats();
              if (activeTab === 'users') fetchUsers();
              else fetchStores();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 self-end sm:self-auto transition"
            title="Refresh table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={activeTab === 'users' ? userSearch : storeSearch}
                onChange={(e) => {
                  if (activeTab === 'users') setUserSearch(e.target.value);
                  else setStoreSearch(e.target.value);
                }}
                placeholder={
                  activeTab === 'users'
                    ? 'Search users by Name, Email, or Address...'
                    : 'Search stores by Name, Email, or Address...'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Role Filter (for Users tab) */}
            {activeTab === 'users' && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">All Roles</option>
                  <option value="NORMAL_USER">Normal Users Only</option>
                  <option value="STORE_OWNER">Store Owners Only</option>
                  <option value="ADMIN">System Admins Only</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content Table: Users */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    onClick={() => handleUserSort('name')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      {renderSortIcon(userSortBy, userSortOrder, 'name')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleUserSort('email')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Email</span>
                      {renderSortIcon(userSortBy, userSortOrder, 'email')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleUserSort('address')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Address</span>
                      {renderSortIcon(userSortBy, userSortOrder, 'address')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleUserSort('role')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Role</span>
                      {renderSortIcon(userSortBy, userSortOrder, 'role')}
                    </div>
                  </th>
                  <th className="py-3.5 px-6">Store & Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loadingUsers ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="w-8 h-8 mx-auto rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-2"></div>
                      <span>Loading user records...</span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-300">No users found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Try modifying your search or role filter</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-medium text-white max-w-[200px] truncate" title={u.name}>
                        {u.name}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-4 px-6 text-slate-400 max-w-[240px] truncate" title={u.address}>
                        {u.address}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="py-4 px-6">
                        {u.role === 'STORE_OWNER' && u.storeRating ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-white truncate max-w-[180px]">
                              {u.storeInfo?.name || 'Assigned Store'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <StarRating
                                currentRating={Math.round(u.storeRating.average)}
                                readOnly
                                size="sm"
                              />
                              <span className="text-[11px] font-mono text-amber-400">
                                {u.storeRating.average} ({u.storeRating.totalRatings})
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Content Table: Stores */}
        {activeTab === 'stores' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    onClick={() => handleStoreSort('name')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Store Name</span>
                      {renderSortIcon(storeSortBy, storeSortOrder, 'name')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleStoreSort('email')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Email</span>
                      {renderSortIcon(storeSortBy, storeSortOrder, 'email')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleStoreSort('address')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Address</span>
                      {renderSortIcon(storeSortBy, storeSortOrder, 'address')}
                    </div>
                  </th>
                  <th className="py-3.5 px-6">Store Owner</th>
                  <th
                    onClick={() => handleStoreSort('rating')}
                    className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Overall Rating</span>
                      {renderSortIcon(storeSortBy, storeSortOrder, 'rating')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loadingStores ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="w-8 h-8 mx-auto rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mb-2"></div>
                      <span>Loading stores...</span>
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <StoreIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-300">No stores found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Try searching with different terms</p>
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-[11px]">
                        {s.email}
                      </td>
                      <td className="py-4 px-6 text-slate-400 max-w-[240px] truncate" title={s.address}>
                        {s.address}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200 text-xs truncate max-w-[160px]">
                            {s.owner?.name || s.owner_name || (s.owner_id ? `Owner ID #${s.owner_id}` : 'Unassigned')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {s.owner?.email || s.owner_email || (s.owner_id ? `User #${s.owner_id}` : '')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <StarRating
                            currentRating={Math.round(s.averageRating)}
                            readOnly
                            size="sm"
                          />
                          <span className="font-bold text-amber-400 font-mono text-xs">
                            {s.averageRating > 0 ? s.averageRating : '0.0'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({s.totalRatings} {s.totalRatings === 1 ? 'rating' : 'ratings'})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserCreated={() => {
          fetchUsers();
          fetchStats();
        }}
      />

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreCreated={() => {
          fetchStores();
          fetchStats();
        }}
      />
    </div>
  );
};
