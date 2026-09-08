const LeadService = require('../services/leadService');
const OtpService = require('../services/otpService');
const ApiResponse = require('../utils/apiResponse');

class LeadController {
  /**
   * POST /api/leads - Create new Customer Lead & Generate OTP
   */
  static async createLead(req, res, next) {
    try {
      const result = await LeadService.createLead(req.body);
      return ApiResponse.success(res, 'Lead submitted successfully! Please verify OTP.', result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/leads/:id/verify-otp - Verify Customer OTP
   */
  static async verifyOtp(req, res, next) {
    try {
      const leadId = req.params.id;
      const { otp } = req.body;

      if (!otp) {
        return ApiResponse.error(res, 'OTP is required.', 400);
      }

      const result = await OtpService.verifyOtp(leadId, otp);

      if (!result.success) {
        return ApiResponse.error(res, result.message, 400);
      }

      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/leads - Get All Submitted Leads (Support status filter)
   */
  static async getAllLeads(req, res, next) {
    try {
      const { status } = req.query;
      const leads = await LeadService.getAllLeads(status);
      return ApiResponse.success(res, 'Leads retrieved successfully.', leads);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/leads/:id - Get Lead Details
   */
  static async getLeadById(req, res, next) {
    try {
      const leadId = req.params.id;
      const lead = await LeadService.getLeadById(leadId);

      if (!lead) {
        return ApiResponse.error(res, 'Lead not found.', 404);
      }

      return ApiResponse.success(res, 'Lead details retrieved successfully.', lead);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/leads/:id/status - Update Lead Status
   */
  static async updateLeadStatus(req, res, next) {
    try {
      const leadId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return ApiResponse.error(res, 'Status field is required.', 400);
      }

      const result = await LeadService.updateLeadStatus(leadId, status);

      if (!result) {
        return ApiResponse.error(res, 'Lead not found.', 404);
      }

      return ApiResponse.success(res, 'Lead status updated successfully.', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeadController;
