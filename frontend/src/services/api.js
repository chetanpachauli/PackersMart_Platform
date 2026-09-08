import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const leadService = {
  // 1. Submit customer lead registration
  submitLead: async (leadData) => {
    const res = await api.post('/leads', leadData);
    return res.data;
  },

  // 2. Verify OTP
  verifyOtp: async (leadId, otp) => {
    const res = await api.post(`/leads/${leadId}/verify-otp`, { otp });
    return res.data;
  },

  // 3. Get leads with status filter
  getLeads: async (status = 'All') => {
    const res = await api.get(`/leads?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  // 4. Get single lead details
  getLeadDetails: async (leadId) => {
    const res = await api.get(`/leads/${leadId}`);
    return res.data;
  },

  // 5. Update lead status
  updateStatus: async (leadId, status) => {
    const res = await api.patch(`/leads/${leadId}/status`, { status });
    return res.data;
  },

  // 6. Get matching companies for lead
  getMatchingCompanies: async (leadId) => {
    const res = await api.get(`/leads/${leadId}/matching-companies`);
    return res.data;
  },

  // 7. Get dashboard stats
  getDashboardStats: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  }
};
