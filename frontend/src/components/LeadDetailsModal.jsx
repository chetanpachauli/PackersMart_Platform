import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Calendar, Truck, Flame, 
  Building2, Star, CheckCircle2, Clock, ShieldAlert, Sparkles 
} from 'lucide-react';
import { leadService } from '../services/api';

export default function LeadDetailsModal({ lead, onClose, onStatusUpdated }) {
  const [currentStatus, setCurrentStatus] = useState(lead.status);
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setStatusMsg('');
    try {
      const response = await leadService.updateStatus(lead.id, newStatus);
      if (response.success) {
        setCurrentStatus(newStatus);
        setStatusMsg(`Status updated to ${newStatus}`);
        onStatusUpdated();
      }
    } catch (err) {
      setStatusMsg('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const getQualityBadge = (quality, score) => {
    if (quality === 'Hot') return <span className="bg-rose-100/90 text-rose-800 border border-rose-200 px-3 py-1 rounded-full font-extrabold text-xs flex items-center"><Flame className="w-3.5 h-3.5 mr-1 text-rose-600 fill-rose-500" /> Hot ({score} pts)</span>;
    if (quality === 'Warm') return <span className="bg-amber-100/90 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-extrabold text-xs flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" /> Warm ({score} pts)</span>;
    if (quality === 'Cold') return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full font-semibold text-xs flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Cold ({score} pts)</span>;
    return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-semibold text-xs">Unverified</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200/80 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 sm:p-7 flex justify-between items-start border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-extrabold">{lead.customer_name}</h2>
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-3 py-1 rounded-lg font-mono font-bold">
                Lead #{lead.id}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              Submitted on {new Date(lead.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-sm">
          {statusMsg && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl text-xs flex items-center justify-between font-bold">
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Quick Action Bar & Quality Badge */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quality Rating:</span>
              {getQualityBadge(lead.lead_quality, lead.lead_score)}
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</label>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Fake">Fake</option>
                <option value="Duplicate">Duplicate</option>
                <option value="Re-attempt">Re-attempt</option>
              </select>
            </div>
          </div>

          {/* Lead Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-indigo-600">Customer Details</h4>
              <div className="flex items-center text-slate-800 space-x-2.5">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-bold">{lead.customer_name}</span>
              </div>
              <div className="flex items-center text-slate-800 space-x-2.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{lead.mobile}</span>
              </div>
              <div className="flex items-center text-slate-800 space-x-2.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{lead.email}</span>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-indigo-600">Relocation Details</h4>
              <div className="flex items-center text-slate-800 space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold"><strong>From:</strong> {lead.pickup_city} &rarr; <strong>To:</strong> {lead.destination_city}</span>
              </div>
              <div className="flex items-center text-slate-800 space-x-2.5">
                <Truck className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{lead.service_type}</span>
              </div>
              <div className="flex items-center text-slate-800 space-x-2.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Moving Date: {new Date(lead.moving_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Additional Requirements */}
          {lead.additional_requirements && (
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <h4 className="font-bold text-slate-700 text-xs uppercase mb-1">Additional Requirements</h4>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">{lead.additional_requirements}</p>
            </div>
          )}

          {/* Matched Companies Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center">
                <Building2 className="w-4.5 h-4.5 text-indigo-600 mr-2" />
                Matched Logistics Companies ({lead.matched_companies?.length || 0})
              </h4>
              <span className="text-xs text-slate-500 font-medium">Rule-based Algorithm Output</span>
            </div>

            {lead.matched_companies && lead.matched_companies.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {lead.matched_companies.map((company, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-indigo-300 transition-colors flex justify-between items-center shadow-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">{company.company_name}</span>
                        <span className="flex items-center text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 mr-1" /> {company.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        📞 {company.contact_phone} | ✉️ {company.email}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {company.coverage_cities.slice(0, 5).map((city, cIdx) => (
                          <span key={cIdx} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full block">
                        {company.match_score}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs font-medium">
                {currentStatus === 'Verified' 
                  ? 'No matching logistics companies found for this city/service combination.'
                  : 'OTP verification required to unlock company matching.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
