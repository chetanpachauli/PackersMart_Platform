import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, Copy, RotateCcw, 
  Flame, Building2, Search, Filter, Eye, RefreshCw, Sparkles 
} from 'lucide-react';
import { leadService } from '../services/api';
import StatCard from './StatCard';
import LeadDetailsModal from './LeadDetailsModal';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeLeadModal, setActiveLeadModal] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, leadsRes] = await Promise.all([
        leadService.getDashboardStats(),
        leadService.getLeads(selectedStatus)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (leadsRes.success) setLeads(leadsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedStatus]);

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.customer_name?.toLowerCase().includes(q) ||
      lead.mobile?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.pickup_city?.toLowerCase().includes(q) ||
      lead.destination_city?.toLowerCase().includes(q) ||
      lead.service_type?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Verified</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">Pending</span>;
      case 'Fake':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 rounded-full border border-rose-200">Fake</span>;
      case 'Duplicate':
        return <span className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 rounded-full border border-purple-200">Duplicate</span>;
      case 'Re-attempt':
        return <span className="px-2.5 py-1 text-xs font-bold bg-sky-50 text-sky-700 rounded-full border border-sky-200">Re-attempt</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">{status}</span>;
    }
  };

  const getQualityPill = (quality, score) => {
    if (quality === 'Hot') return <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center w-fit"><Flame className="w-3.5 h-3.5 mr-1 text-rose-500 fill-rose-500" /> Hot ({score})</span>;
    if (quality === 'Warm') return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center w-fit"><Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" /> Warm ({score})</span>;
    if (quality === 'Cold') return <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg w-fit">Cold ({score})</span>;
    return <span className="text-[11px] text-slate-400 font-mono">—</span>;
  };

  const handleOpenLead = async (leadId) => {
    try {
      const res = await leadService.getLeadDetails(leadId);
      if (res.success) {
        setActiveLeadModal(res.data);
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 text-white p-7 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Admin Queue & Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Lead Operations Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Real-time lead processing, Quality scoring classification, and rule-based company matching.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="relative flex items-center space-x-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all w-fit shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Leads"
            value={stats.total_leads}
            icon={Users}
            colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100"
          />
          <StatCard
            title="Verified"
            value={stats.verified_leads}
            icon={CheckCircle2}
            colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
            badgeText={`Hot: ${stats.quality_breakdown.Hot} | Warm: ${stats.quality_breakdown.Warm}`}
          />
          <StatCard
            title="Pending OTP"
            value={stats.pending_leads}
            icon={Clock}
            colorClass="bg-amber-50 text-amber-600 border border-amber-100"
          />
          <StatCard
            title="Fake Leads"
            value={stats.fake_leads}
            icon={AlertTriangle}
            colorClass="bg-rose-50 text-rose-600 border border-rose-100"
          />
          <StatCard
            title="Duplicate"
            value={stats.duplicate_leads}
            icon={Copy}
            colorClass="bg-purple-50 text-purple-600 border border-purple-100"
          />
          <StatCard
            title="Matched Matches"
            value={stats.matched_leads_count}
            icon={Building2}
            colorClass="bg-sky-50 text-sky-600 border border-sky-100"
            badgeText={`${stats.active_companies_count} Active Movers`}
          />
        </div>
      )}

      {/* Main Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Controls Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'Pending', 'Verified', 'Fake', 'Duplicate', 'Re-attempt'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 bg-white"
            />
          </div>
        </div>

        {/* Lead Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                <th className="py-4 px-5">Customer Info</th>
                <th className="py-4 px-5">Route & Service</th>
                <th className="py-4 px-5">Moving Date</th>
                <th className="py-4 px-5">Quality Score</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    Loading lead queue...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No leads found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer Info */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{lead.customer_name}</span>
                        <div className="text-slate-500 text-xs mt-0.5">
                          <span>📞 {lead.mobile}</span> | <span>✉️ {lead.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Route & Service */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-bold text-slate-800">
                          {lead.pickup_city} &rarr; {lead.destination_city}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          {lead.service_type}
                        </span>
                      </div>
                    </td>

                    {/* Moving Date */}
                    <td className="py-4 px-5 font-semibold text-slate-700">
                      {new Date(lead.moving_date).toLocaleDateString()}
                    </td>

                    {/* Quality Score */}
                    <td className="py-4 px-5">
                      {getQualityPill(lead.lead_quality, lead.lead_score)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenLead(lead.id)}
                        className="inline-flex items-center space-x-1 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors text-xs border border-indigo-200/80 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Match</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {activeLeadModal && (
        <LeadDetailsModal
          lead={activeLeadModal}
          onClose={() => setActiveLeadModal(null)}
          onStatusUpdated={fetchDashboardData}
        />
      )}
    </div>
  );
}
