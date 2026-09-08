const { pool } = require('../config/db');
const OtpService = require('./otpService');
const MatchingService = require('./matchingService');
const LeadScoringService = require('./leadScoringService');

class LeadService {
  /**
   * Create customer lead & generate OTP
   */
  static async createLead(leadData) {
    const connection = await pool.getConnection();
    try {
      const {
        customer_name,
        mobile,
        email,
        pickup_city,
        destination_city,
        service_type,
        moving_date,
        additional_requirements
      } = leadData;

      // Check duplicate lead (same mobile & pickup & destination within last 24h)
      const [existing] = await connection.query(
        `SELECT id, status FROM leads 
         WHERE mobile = ? AND pickup_city = ? AND destination_city = ? 
         AND created_at >= NOW() - INTERVAL 1 DAY`,
        [mobile, pickup_city, destination_city]
      );

      let initialStatus = 'Pending';
      let initialQuality = 'Unverified';
      if (existing.length > 0) {
        initialStatus = 'Duplicate';
      }

      // Insert Lead
      const [result] = await connection.query(
        `INSERT INTO leads 
         (customer_name, mobile, email, pickup_city, destination_city, service_type, moving_date, additional_requirements, status, lead_quality) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer_name,
          mobile,
          email,
          pickup_city,
          destination_city,
          service_type,
          moving_date,
          additional_requirements || '',
          initialStatus,
          initialQuality
        ]
      );

      const leadId = result.insertId;

      // Generate OTP
      const { otp, expiresAt } = await OtpService.generateAndSaveOtp(leadId);

      return {
        lead_id: leadId,
        customer_name,
        mobile,
        email,
        pickup_city,
        destination_city,
        service_type,
        moving_date,
        status: initialStatus,
        otp_testing: otp, // Included for 1-day assessment testing convenience
        otp_expires_at: expiresAt
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get all leads with optional status filter
   */
  static async getAllLeads(statusFilter = null) {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM leads';
      const params = [];

      if (statusFilter && statusFilter !== 'All') {
        query += ' WHERE status = ?';
        params.push(statusFilter);
      }

      query += ' ORDER BY created_at DESC';

      const [leads] = await connection.query(query, params);
      return leads;
    } finally {
      connection.release();
    }
  }

  /**
   * Get Lead by ID with matched companies & latest OTP
   */
  static async getLeadById(leadId) {
    const connection = await pool.getConnection();
    try {
      const [leads] = await connection.query('SELECT * FROM leads WHERE id = ?', [leadId]);
      if (leads.length === 0) {
        return null;
      }

      const lead = leads[0];

      // Get latest OTP for testing view
      const [otps] = await connection.query(
        'SELECT otp, expires_at, is_used FROM otp_verifications WHERE lead_id = ? ORDER BY id DESC LIMIT 1',
        [leadId]
      );

      // Get Matched Companies
      const matches = await MatchingService.getMatchesForLead(leadId);

      return {
        ...lead,
        latest_otp: otps.length > 0 ? otps[0] : null,
        matched_companies: matches
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Update Lead Status (Pending, Verified, Fake, Duplicate, Re-attempt)
   */
  static async updateLeadStatus(leadId, newStatus) {
    const connection = await pool.getConnection();
    try {
      const validStatuses = ['Pending', 'Verified', 'Fake', 'Duplicate', 'Re-attempt'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const [leads] = await connection.query('SELECT * FROM leads WHERE id = ?', [leadId]);
      if (leads.length === 0) {
        return null;
      }

      const lead = leads[0];

      // If status updated to Verified manually by Admin, calculate score & match companies
      let score = lead.lead_score;
      let quality = lead.lead_quality;
      let matchedCompanies = [];

      if (newStatus === 'Verified') {
        const scoreRes = LeadScoringService.calculateScoreAndQuality(lead);
        score = scoreRes.score;
        quality = scoreRes.quality;
        matchedCompanies = await MatchingService.findAndSaveMatchingCompanies(leadId);
      }

      await connection.query(
        'UPDATE leads SET status = ?, lead_score = ?, lead_quality = ? WHERE id = ?',
        [newStatus, score, quality, leadId]
      );

      return {
        id: leadId,
        status: newStatus,
        lead_score: score,
        lead_quality: quality,
        matched_companies_count: matchedCompanies.length
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Dashboard Statistics Metrics Aggregation
   */
  static async getDashboardStats() {
    const connection = await pool.getConnection();
    try {
      // Total leads
      const [[{ total_leads }]] = await connection.query('SELECT COUNT(*) as total_leads FROM leads');

      // Status breakdown
      const [statusRows] = await connection.query(
        'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
      );

      // Quality breakdown
      const [qualityRows] = await connection.query(
        "SELECT lead_quality, COUNT(*) as count FROM leads WHERE status = 'Verified' GROUP BY lead_quality"
      );

      // Total Matched Companies records count
      const [[{ total_matches }]] = await connection.query(
        'SELECT COUNT(DISTINCT lead_id) as total_matches FROM lead_company_matches'
      );

      const [[{ active_companies }]] = await connection.query(
        "SELECT COUNT(*) as active_companies FROM companies WHERE status = 'Active'"
      );

      const statusMap = {
        Pending: 0,
        Verified: 0,
        Fake: 0,
        Duplicate: 0,
        'Re-attempt': 0
      };

      statusRows.forEach(row => {
        if (statusMap.hasOwnProperty(row.status)) {
          statusMap[row.status] = row.count;
        }
      });

      const qualityMap = {
        Hot: 0,
        Warm: 0,
        Cold: 0
      };

      qualityRows.forEach(row => {
        if (qualityMap.hasOwnProperty(row.lead_quality)) {
          qualityMap[row.lead_quality] = row.count;
        }
      });

      return {
        total_leads,
        pending_leads: statusMap.Pending,
        verified_leads: statusMap.Verified,
        fake_leads: statusMap.Fake,
        duplicate_leads: statusMap.Duplicate,
        reattempt_leads: statusMap['Re-attempt'],
        quality_breakdown: qualityMap,
        matched_leads_count: total_matches,
        active_companies_count: active_companies
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = LeadService;
