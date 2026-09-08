import React, { useState } from 'react';
import { 
  User, Phone, Mail, MapPin, Calendar, Truck, FileText, 
  Send, AlertCircle, ShieldAlert, Sparkles, CheckCircle2
} from 'lucide-react';
import { leadService } from '../services/api';

export default function LeadForm({ onLeadCreated }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile: '',
    email: '',
    pickup_city: '',
    destination_city: '',
    service_type: 'Home Relocation',
    moving_date: '',
    additional_requirements: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const indianCities = [
    'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 
    'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh', 
    'Lucknow', 'Gurgaon', 'Noida', 'Indore', 'Kochi'
  ];

  const validate = () => {
    const errs = {};
    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      errs.customer_name = 'Full name is required (min 2 chars)';
    }

    if (!formData.mobile.trim() || !/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      errs.mobile = 'Enter valid 10-digit Indian phone number starting with 6-9';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email address is required';
    }

    if (!formData.pickup_city.trim()) {
      errs.pickup_city = 'Pickup city is required';
    }

    if (!formData.destination_city.trim()) {
      errs.destination_city = 'Destination city is required';
    }

    if (!formData.moving_date) {
      errs.moving_date = 'Preferred moving date is required';
    } else {
      const selected = new Date(formData.moving_date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected < today) {
        errs.moving_date = 'Moving date cannot be in the past';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await leadService.submitLead(formData);
      if (response.success) {
        onLeadCreated(response.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit lead. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden transition-all">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-7 sm:p-9 border-b border-indigo-900/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center space-x-3 mb-2.5 relative">
            <span className="p-2.5 bg-indigo-600/25 rounded-2xl text-indigo-400 border border-indigo-500/30 shadow-inner">
              <Truck className="w-6 h-6" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Request Relocation Quotes</h2>
          </div>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed relative">
            Fill out your relocation details to get instant quotes from verified Packers & Movers. Instant 6-digit OTP verification required.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 sm:p-9 space-y-6">
          {apiError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-sm animate-shake">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="e.g. Chetan Pachauli"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                    errors.customer_name
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.customer_name && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.customer_name}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                    errors.mobile
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.mobile}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. chetan@example.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                    errors.email
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.email}
                </p>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Service Type <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Truck className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/30 focus:bg-white"
                >
                  <option value="Home Relocation">🏠 Home Relocation</option>
                  <option value="Vehicle Transport">🚗 Vehicle Transport</option>
                  <option value="Office Relocation">🏢 Office Relocation</option>
                  <option value="Commercial Goods">📦 Commercial Goods</option>
                </select>
              </div>
            </div>

            {/* Pickup City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pickup City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="pickup_city"
                  list="city-options"
                  value={formData.pickup_city}
                  onChange={handleChange}
                  placeholder="Select or type Pickup City"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                    errors.pickup_city
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.pickup_city && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.pickup_city}
                </p>
              )}
            </div>

            {/* Destination City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Destination City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="destination_city"
                  list="city-options"
                  value={formData.destination_city}
                  onChange={handleChange}
                  placeholder="Select or type Destination City"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                    errors.destination_city
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.destination_city && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.destination_city}
                </p>
              )}
            </div>

            {/* Datalist for Cities */}
            <datalist id="city-options">
              {indianCities.map((city, idx) => (
                <option key={idx} value={city} />
              ))}
            </datalist>

            {/* Moving Date */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Moving Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="moving_date"
                  value={formData.moving_date}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                    errors.moving_date
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.moving_date && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.moving_date}
                </p>
              )}
            </div>

            {/* Additional Requirements */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Requirements (Optional)
              </label>
              <div className="relative">
                <FileText className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <textarea
                  name="additional_requirements"
                  rows={3}
                  value={formData.additional_requirements}
                  onChange={handleChange}
                  placeholder="e.g. 2 BHK household items, fragile packing needed, 1 car transport included..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/30 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/25 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2.5 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Submitting Lead...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Lead & Request OTP</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
