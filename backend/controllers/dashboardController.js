const LeadService = require('../services/leadService');
const ApiResponse = require('../utils/apiResponse');

class DashboardController {
  /**
   * GET /api/dashboard - Get Dashboard Statistics and Lead Metrics
   */
  static async getDashboardStats(req, res, next) {
    try {
      const stats = await LeadService.getDashboardStats();
      return ApiResponse.success(res, 'Dashboard statistics retrieved successfully.', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
