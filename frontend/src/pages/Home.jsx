import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  Store,
  ShieldCheck,
  User,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Search,
  LogIn,
  UserPlus,
  Building2,
  BarChart3,
  TrendingUp,
  Sliders,
  Check
} from 'lucide-react';

export const Home = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 animate-fade-in selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Verified Community Store Ratings & Reviews</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Real Feedback for Real Stores.{' '}
                <span className="text-indigo-400">Simple & Transparent.</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                FeedBack Store connects local customers with verified store ratings. Explore stores, submit 1-to-5 star reviews, and empower store owners with live rating analytics.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <Link
                  to="/stores"
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Stores</span>
                </Link>

                <Link
                  to="/signup"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl transition flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up Free</span>
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3.5 text-slate-400 hover:text-white font-bold text-sm transition flex items-center gap-1.5"
                >

                </Link>
              </div>

            </div>

            {/* Right Visual Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 group">
                <img
                  src="/images/hero_rating_clean.jpg"
                  alt="Customer Submitting 5 Star Rating"
                  className="w-full h-auto object-cover transform group-hover:scale-102 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Instant Feedback</span>
                    <p className="text-xs font-bold text-white mt-0.5">1-to-5 Star Community Ratings</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>5.0 Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="bg-slate-900/40 py-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <p className="text-3xl font-black text-white font-mono">100+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Active Stores</p>
            </div>
            <div className="p-3">
              <p className="text-3xl font-black text-white font-mono">600+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Verified Ratings</p>
            </div>
            <div className="p-3">
              <p className="text-3xl font-black text-white font-mono">1 to 5 ★</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Rating Scale</p>
            </div>
            <div className="p-3">
              <p className="text-3xl font-black text-white font-mono">3</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Protected Roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Feature Spotlight: Analytics & Insights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Image */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
              <img
                src="/images/analytics_insights_clean.jpg"
                alt="Store Analytics & Customer Breakdown"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Real-Time Business Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Actionable Rating Analytics for Store Owners
            </h2>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Store owners receive an instant overview of their customer reputation, including average scores, rating distribution breakdowns, and reviewer history.
            </p>

            <div className="mt-6 space-y-3.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Live Average Score Calculation</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Overall rating updates dynamically as customers submit or modify feedback.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Star Distribution Breakdown</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Visual progress bars displaying 5★, 4★, 3★, 2★, and 1★ customer proportions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Verified Reviewer History Table</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Searchable history with customer name, email, rating score, and timestamp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Breakdown Cards */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Role-Based Access for Everyone
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            One unified platform providing dedicated interfaces for customers, owners, and administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Normal User */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Normal User</h3>
              <p className="text-xs text-blue-400 font-semibold mt-0.5">Shopper & Reviewer</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Simple signup with zero address required. Search stores by Name or Address and submit 1–5 star ratings.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>No address required at signup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>Search stores by Name & Address</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rate stores 1–5 stars & modify anytime</span>
                </li>
              </ul>
            </div>
            <Link
              to="/stores"
              className="mt-6 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Explore Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Store Owner */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Store Owner</h3>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">Business & Store Manager</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Register your store, inspect customer review breakdown, and monitor your overall reputation.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Register & setup your own store</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live average rating score & distribution</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer review history breakdown table</span>
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="mt-6 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Register Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* System Administrator */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">System Admin</h3>
              <p className="text-xs text-purple-400 font-semibold mt-0.5">Platform Governance</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Full platform overview. Manage user accounts, create stores, and monitor directory ratings.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                  <span>Real-time platform metrics dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                  <span>Create system users, admins & stores</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                  <span>Search, filter & sort all directories</span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3-Step How It Works Section */}
      <section className="py-16 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white">How It Works in 3 Simple Steps</h2>
          <p className="text-xs text-slate-400 mt-1">Frictionless feedback collection for customers and businesses</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">1</div>
              <h4 className="text-sm font-bold text-white">1. Discover Stores</h4>
              <p className="text-xs text-slate-400 mt-1">Search the verified store directory by store name or address with live sorting filters.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">2</div>
              <h4 className="text-sm font-bold text-white">2. Rate 1 to 5 Stars</h4>
              <p className="text-xs text-slate-400 mt-1">Click to submit your rating. Registered users can update or modify their rating anytime.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">3</div>
              <h4 className="text-sm font-bold text-white">3. Actionable Insights</h4>
              <p className="text-xs text-slate-400 mt-1">Store owners and admins monitor reputation metrics, customer trends, and review history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Store className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-300">FeedBack Store</span>
            <span>— Store Directory & Rating Platform</span>
          </div>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span>All systems operational</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
