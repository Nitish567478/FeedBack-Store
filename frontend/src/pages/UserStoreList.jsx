import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { AuthModal } from '../components/AuthModal';
import {
  Store,
  Star,
  Search,
  ArrowUpDown,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogIn,
  UserCheck,
  MessageSquarePlus,
  BadgeCheck
} from 'lucide-react';

export const UserStoreList = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const newStoreCreated = searchParams.get('new_store');

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Submissions & Modal state
  const [submittingStoreId, setSubmittingStoreId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [pendingRating, setPendingRating] = useState(5);

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, order, isAuthenticated]);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const sortField = sortBy === 'rating' || sortBy === 'overallRating' ? 'avg_rating' : sortBy;
      const params = {
        sortBy,
        sort_by: sortField,
        order,
        sort_order: order.toUpperCase()
      };
      if (search && search.trim()) {
        params.search = search.trim();
        params.name = search.trim();
      }

      let res;
      try {
        res = await axiosInstance.get('/user/stores', { params });
      } catch (e) {
        try {
          res = await axiosInstance.get('/stores', { params });
        } catch (fallbackErr) {
          console.warn('Store fetch error:', e.message, fallbackErr.message);
        }
      }

      const rawStores = res?.data?.stores || (Array.isArray(res?.data) ? res.data : []);

      const mappedStores = rawStores.map((s) => {
        const avg = s.avg_rating !== undefined ? s.avg_rating : (s.overallRating !== undefined ? s.overallRating : (s.averageNumeric || 0));
        const userRate = s.user_rating !== undefined ? s.user_rating : (s.userSubmittedRating !== undefined ? s.userSubmittedRating : null);
        const avgNum = typeof avg === 'number' ? avg : parseFloat(avg || 0);
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          address: s.address,
          overallRating: avgNum,
          averageNumeric: avgNum,
          totalRatings: s.ratings_count ?? s.totalRatings ?? (s.ratings ? s.ratings.length : (avgNum > 0 ? 1 : 0)),
          userSubmittedRating: userRate
        };
      });

      setStores(mappedStores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      if (stores.length === 0) {
        setError('Unable to load stores. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (store, starValue) => {
    if (!isAuthenticated) {
      setSelectedStore(store);
      setPendingRating(starValue);
      setAuthModalOpen(true);
      return;
    }
    handleRatingSubmit(store.id, starValue);
  };

  const handleRatingSubmit = async (storeId, newRatingValue) => {
    setSubmittingStoreId(storeId);
    setFeedbackMessage(null);

    try {
      // Try /user/ratings (live Render backend) first, with fallback to /stores/:id/rate
      try {
        await axiosInstance.post('/user/ratings', {
          store_id: Number(storeId) || storeId,
          rating: Number(newRatingValue)
        });
      } catch (postErr) {
        if (postErr.response?.status === 404) {
          await axiosInstance.post(`/stores/${storeId}/rate`, {
            rating: Number(newRatingValue)
          });
        } else {
          throw postErr;
        }
      }

      // Update local state smoothly
      setStores((prevStores) =>
        prevStores.map((s) => {
          if (s.id === storeId) {
            const currentAvg = s.averageNumeric || 0;
            const hadRating = s.userSubmittedRating !== null && s.userSubmittedRating > 0;
            const newCount = hadRating ? (s.totalRatings || 1) : (s.totalRatings || 0) + 1;
            const newAvg = hadRating 
              ? currentAvg 
              : ((currentAvg * (s.totalRatings || 0) + newRatingValue) / newCount);

            return {
              ...s,
              overallRating: Number(newAvg.toFixed(1)),
              averageNumeric: Number(newAvg.toFixed(1)),
              totalRatings: newCount,
              userSubmittedRating: newRatingValue
            };
          }
          return s;
        })
      );

      setFeedbackMessage({
        type: 'success',
        text: `Your rating of ${newRatingValue} star${newRatingValue > 1 ? 's' : ''} has been recorded!`
      });

      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3500);
    } catch (err) {
      const errText = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 
        'Failed to submit rating';
      setFeedbackMessage({
        type: 'error',
        text: typeof errText === 'string' ? errText : JSON.stringify(errText)
      });
    } finally {
      setSubmittingStoreId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 mb-8 border border-slate-800">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Explore & Review
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Store Directory & Ratings
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Discover community-rated stores across the network. All visitors can browse stores and ratings freely. Click any rating or "Rate Store" to submit your feedback.
          </p>
        </div>
      </div>

      {/* Newly Created Store Celebration Banner */}
      {newStoreCreated && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-emerald-200">🎉 Store Registered Successfully!</p>
              <p className="text-xs text-emerald-300 mt-0.5">
                "{decodeURIComponent(newStoreCreated)}" has been created and is now live in the store directory below.
              </p>
            </div>
          </div>
          {isAuthenticated && user?.role === 'STORE_OWNER' && (
            <Link
              to="/owner/dashboard"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition self-start sm:self-auto shadow-lg shadow-emerald-600/20"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Go to My Dashboard</span>
            </Link>
          )}
        </div>
      )}

      {/* Connection error banner (only if critical failure) */}
      {error && (
        <div className="mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-red-200">Backend Notice</p>
              <p className="text-xs text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchStores}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Floating feedback alert */}
      {feedbackMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xl animate-fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Name or Address */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by Name or Address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                setSortBy(newSort);
                setOrder(newOrder);
              }}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition cursor-pointer"
            >
              <option value="name-asc">Sort by: Store Name (A-Z)</option>
              <option value="name-desc">Sort by: Store Name (Z-A)</option>
              <option value="rating-desc">Sort by: Highest Rating</option>
              <option value="rating-asc">Sort by: Lowest Rating</option>
              <option value="createdAt-desc">Sort by: Newest Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Store Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-10 h-10 mx-auto rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin mb-3"></div>
          <p className="font-semibold text-sm">Loading store catalog...</p>
        </div>
      ) : stores.length === 0 && !error ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800">
          <Store className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">No Stores Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? `We couldn't find any stores matching "${search}".` : 'No stores registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const hasUserRating = store.userSubmittedRating !== null && store.userSubmittedRating > 0;

            return (
              <div
                key={store.id}
                className="glass-card rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  {/* Store Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white leading-tight">
                            {store.name}
                          </h3>
                          {user && (user.email === store.email || user.store?.id === store.id || user.store?.name === store.name) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <BadgeCheck className="w-3 h-3" />
                              Your Store
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {store.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Store Address */}
                  <div className="flex items-start gap-2 text-slate-300 text-xs my-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{store.address}</span>
                  </div>

                  {/* Overall Store Rating Score */}
                  <div className="flex items-center justify-between py-2 border-y border-slate-800/80 my-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Overall Rating
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating
                          currentRating={Math.round(store.averageNumeric || 0)}
                          readOnly
                          size="sm"
                        />
                        <span className="font-extrabold text-amber-400 font-mono text-sm">
                          {store.averageNumeric > 0 ? store.averageNumeric.toFixed(1) : 'No ratings'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Reviews
                      </span>
                      <span className="text-xs font-semibold text-slate-300 font-mono">
                        {store.totalRatings} {store.totalRatings === 1 ? 'Rating' : 'Ratings'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Rating Action Section */}
                <div className="mt-2 pt-3 border-t border-slate-800/50">
                  <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        {isAuthenticated
                          ? hasUserRating
                            ? 'Your Rating (Modify):'
                            : 'Rate this Store:'
                          : 'Submit Your Rating:'}
                      </span>
                      {hasUserRating && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {store.userSubmittedRating} / 5 Stars
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <StarRating
                        currentRating={store.userSubmittedRating || 0}
                        onRatingSubmit={(val) => handleRatingClick(store, val)}
                        size="md"
                        submitting={submittingStoreId === store.id}
                      />
                      <button
                        onClick={() => handleRatingClick(store, store.userSubmittedRating || 5)}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-xl border border-indigo-500/20 transition flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        {isAuthenticated ? (hasUserRating ? 'Edit' : 'Rate') : 'Rate Store'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Login/Register Required Pop-Up Modal for Guests */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        targetStore={selectedStore}
        pendingRating={pendingRating}
        onRatingComplete={handleRatingSubmit}
      />
    </div>
  );
};
