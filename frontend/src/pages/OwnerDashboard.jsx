import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import {
  Store,
  Star,
  Users,
  MapPin,
  Mail,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Sparkles,
  BarChart3,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Table filtering & sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [order, setOrder] = useState('desc');

  // Store creation state if no store exists yet
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [creatingStore, setCreatingStore] = useState(false);
  const [createStoreError, setCreateStoreError] = useState('');
  const [createStoreSuccess, setCreateStoreSuccess] = useState('');

  useEffect(() => {
    fetchOwnerData();
  }, [search, sortBy, order]);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const params = { sortBy, order };
      if (search) params.search = search;

      const res = await axiosInstance.get('/owner/dashboard', { params });
      const raw = res.data;

      // Handle live Render backend envelope: { stores: [ { store_id, store_name, avg_rating, ratings_count, raters: [] } ] }
      if (raw && raw.stores !== undefined) {
        if (!Array.isArray(raw.stores) || raw.stores.length === 0) {
          setData({ hasStore: false, store: null, metrics: null, customerRatings: [] });
        } else {
          const s = raw.stores[0];
          const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          (s.raters || []).forEach((r) => {
            const star = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
            dist[star] = (dist[star] || 0) + 1;
          });

          let ratersList = (s.raters || []).map((r) => ({
            id: r.id,
            rating: Number(r.rating) || 0,
            updatedAt: r.created_at || new Date().toISOString(),
            user: {
              name: r.name,
              email: r.email,
              address: r.address || '—'
            }
          }));

          // Client-side search filtering if needed
          if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            ratersList = ratersList.filter(
              (r) =>
                r.user.name?.toLowerCase().includes(q) ||
                r.user.email?.toLowerCase().includes(q) ||
                r.user.address?.toLowerCase().includes(q)
            );
          }

          if (sortBy === 'name') {
            ratersList.sort((a, b) =>
              order === 'asc'
                ? a.user.name.localeCompare(b.user.name)
                : b.user.name.localeCompare(a.user.name)
            );
          } else if (sortBy === 'email') {
            ratersList.sort((a, b) =>
              order === 'asc'
                ? a.user.email.localeCompare(b.user.email)
                : b.user.email.localeCompare(a.user.email)
            );
          } else if (sortBy === 'rating') {
            ratersList.sort((a, b) =>
              order === 'asc' ? a.rating - b.rating : b.rating - a.rating
            );
          } else {
            ratersList.sort((a, b) =>
              order === 'asc'
                ? new Date(a.updatedAt) - new Date(b.updatedAt)
                : new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          }

          setData({
            hasStore: true,
            store: {
              id: s.store_id,
              name: s.store_name,
              email: s.email || user?.email || '',
              address: s.address || user?.address || 'Store Location'
            },
            metrics: {
              averageRating: Number(s.avg_rating) || 0,
              totalRatings: Number(s.ratings_count) || s.raters?.length || 0,
              ratingDistribution: dist
            },
            customerRatings: ratersList
          });
        }
      } else {
        setData(raw);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStoreSubmit = async (e) => {
    e.preventDefault();
    setCreateStoreError('');
    setCreateStoreSuccess('');

    if (!newStoreData.name.trim()) {
      setCreateStoreError('Store Name is required.');
      return;
    }
    if (!newStoreData.address.trim()) {
      setCreateStoreError('Store Address is required.');
      return;
    }

    setCreatingStore(true);
    try {
      await axiosInstance.post('/owner/store', newStoreData);
      setCreateStoreSuccess('Your store has been created successfully!');
      setTimeout(() => {
        fetchOwnerData();
      }, 1000);
    } catch (err) {
      setCreateStoreError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setCreatingStore(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />;
    }
    return order === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
    );
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-10 h-10 mx-auto rounded-full border-3 border-emerald-500/20 border-t-emerald-500 animate-spin mb-3"></div>
        <p className="font-semibold text-sm">Loading your store analytics...</p>
      </div>
    );
  }

  // If Store Owner does not have a registered store yet, render the creation view!
  if (data && data.hasStore === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Setup Your Store</h1>
              <p className="text-xs text-slate-400">Register your store location to start receiving customer ratings</p>
            </div>
          </div>

          {createStoreError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{createStoreError}</span>
            </div>
          )}

          {createStoreSuccess && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{createStoreSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateStoreSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Store Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={newStoreData.name}
                onChange={(e) => setNewStoreData({ ...newStoreData, name: e.target.value })}
                placeholder="e.g. Grand Valley Gourmet Grocers"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Store Email (Optional)
              </label>
              <input
                type="email"
                value={newStoreData.email}
                onChange={(e) => setNewStoreData({ ...newStoreData, email: e.target.value })}
                placeholder="Defaults to your account email if blank"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Store Physical Address <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={newStoreData.address}
                onChange={(e) => setNewStoreData({ ...newStoreData, address: e.target.value })}
                placeholder="e.g. 1204 Valley Marketplace Highway, Seattle, WA"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creatingStore || !newStoreData.name.trim() || !newStoreData.address.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {creatingStore ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Register Store & Open Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800">
          <Store className="w-12 h-12 mx-auto text-amber-400 mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Store Account Notice</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const { store, metrics, customerRatings = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Store Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 mb-8 border border-slate-800">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white flex-shrink-0">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Store Owner Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {store?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {store?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {store?.address}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={fetchOwnerData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-2 text-xs font-semibold self-start md:self-auto transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Average Rating Score Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Store Average Rating
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-black text-white font-mono">
              {metrics?.averageRating ? metrics.averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-sm font-semibold text-slate-400">out of 5.0</span>
          </div>
          <div className="mt-3">
            <StarRating
              currentRating={Math.round(metrics?.averageRating || 0)}
              readOnly
              size="md"
            />
          </div>
        </div>

        {/* Total Ratings Count Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Customer Ratings
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-black text-white font-mono">
              {metrics?.totalRatings || 0}
            </span>
            <span className="text-sm font-semibold text-slate-400">Verified Reviews</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Submitted by registered community members
          </p>
        </div>

        {/* Star Rating Distribution breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rating Distribution
            </span>
            <BarChart3 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = metrics?.ratingDistribution?.[stars] || 0;
              const total = metrics?.totalRatings || 1;
              const percent = Math.round((count / (metrics?.totalRatings || 1)) * 100);

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-mono text-slate-400 text-right">{stars}★</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${metrics?.totalRatings > 0 ? percent : 0}%` }}
                    ></div>
                  </div>
                  <span className="w-8 font-mono text-slate-500 text-right text-[11px]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Ratings Breakdown Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Customer Rating History</h2>
            <p className="text-xs text-slate-400">
              Detailed breakdown of users who have submitted ratings for your store
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, address..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email</span>
                    {renderSortIcon('email')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Address</th>
                <th
                  onClick={() => handleSort('rating')}
                  className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted Rating</span>
                    {renderSortIcon('rating')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('updatedAt')}
                  className="py-3.5 px-6 cursor-pointer hover:text-white transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date & Time</span>
                    {renderSortIcon('updatedAt')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customerRatings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Star className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No customer ratings yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ratings submitted by users for your store will appear here in real-time.
                    </p>
                  </td>
                </tr>
              ) : (
                customerRatings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 font-semibold text-white max-w-[200px] truncate">
                      {item.user?.name}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-mono text-[11px]">
                      {item.user?.email}
                    </td>
                    <td className="py-4 px-6 text-slate-400 max-w-[240px] truncate" title={item.user?.address || 'N/A'}>
                      {item.user?.address || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <StarRating
                          currentRating={item.rating}
                          readOnly
                          size="sm"
                        />
                        <span className="font-bold text-amber-400 font-mono text-xs">
                          {item.rating} / 5
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(item.updatedAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
