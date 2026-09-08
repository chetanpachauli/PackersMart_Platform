const { pool } = require('../config/db');
const LeadScoringService = require('./leadScoringService');
const MatchingService = require('./matchingService');

class OtpService {
  /**
   * Generate 6-digit OTP and save to DB with 5-minute expiry time
   */
  static async generateAndSaveOtp(leadId) {
    const connection = await pool.getConnection();
    try {
      // 6-digit random OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Expiry time = current time + 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await connection.query(
        `INSERT INTO otp_verifications (lead_id, otp, expires_at) VALUES (?, ?, ?)`,
        [leadId, otp, expiresAt]
      );

      console.log(`[OTP DEBUG] Generated OTP ${otp} for Lead ID #${leadId} (Expires at: ${expiresAt.toISOString()})`);

      return { otp, expiresAt };
    } finally {
      connection.release();
    }
  }

  /**
   * Verify User Provided OTP
   */
  static async verifyOtp(leadId, userOtp) {
    const connection = await pool.getConnection();
    try {
      // 1. Fetch latest OTP for this lead
      const [otpRows] = await connection.query(
        `SELECT * FROM otp_verifications 
         WHERE lead_id = ? AND is_used = 0 
         ORDER BY id DESC LIMIT 1`,
        [leadId]
      );

      if (otpRows.length === 0) {
        return { success: false, message: 'No active OTP found for this lead.' };
      }

      const otpRecord = otpRows[0];
      const now = new Date();
      const expiresAt = new Date(otpRecord.expires_at);

      // Check Expiry
      if (now > expiresAt) {
        return { success: false, message: 'OTP has expired. Please request a new OTP.' };
      }

      // Check OTP match
      if (otpRecord.otp !== userOtp.toString().trim()) {
        return { success: false, message: 'Invalid OTP entered. Please try again.' };
      }

      // 2. Mark OTP as used
      await connection.query(
        `UPDATE otp_verifications SET is_used = 1, verified_at = ? WHERE id = ?`,
        [now, otpRecord.id]
      );

      // 3. Fetch lead info
      const [leads] = await connection.query('SELECT * FROM leads WHERE id = ?', [leadId]);
      const lead = leads[0];

      // 4. Calculate Lead Score & Quality Classification
      const { score, quality } = LeadScoringService.calculateScoreAndQuality(lead);

      // 5. Update Lead Status to 'Verified', lead_score, lead_quality
      await connection.query(
        `UPDATE leads SET status = 'Verified', lead_score = ?, lead_quality = ? WHERE id = ?`,
        [score, quality, leadId]
      );

      // 6. Automatically trigger Logistics Company Matching
      const matchedCompanies = await MatchingService.findAndSaveMatchingCompanies(leadId);

      return {
        success: true,
        message: 'OTP verified successfully! Lead is now Verified.',
        lead: {
          ...lead,
          status: 'Verified',
          lead_score: score,
          lead_quality: quality
        },
        matched_companies_count: matchedCompanies.length,
        matchedCompanies
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = OtpService;
