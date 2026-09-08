import React from 'react';
import { Truck, LayoutDashboard, UserPlus, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('form')}>
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  PackersMart
                </span>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-indigo-950/80 text-indigo-300 rounded-full border border-indigo-700/60 uppercase">
                  Enterprise MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Logistics & Relocation Marketplace</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Book Relocation</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/50 font-medium shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Backend Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
