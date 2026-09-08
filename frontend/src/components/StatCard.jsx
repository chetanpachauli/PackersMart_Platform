import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass, badgeText }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {badgeText && (
            <span className="inline-block mt-2 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {badgeText}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
