const MatchingService = require('../services/matchingService');
const ApiResponse = require('../utils/apiResponse');

class CompanyController {
  /**
   * GET /api/leads/:id/matching-companies
   * Fetch matching logistics companies for a given verified lead
   */
  static async getMatchingCompanies(req, res, next) {
    try {
      const leadId = req.params.id;
      const matches = await MatchingService.getMatchesForLead(leadId);

      // If no matches yet in DB, try executing matching logic on the fly
      if (matches.length === 0) {
        await MatchingService.findAndSaveMatchingCompanies(leadId);
        const freshMatches = await MatchingService.getMatchesForLead(leadId);
        return ApiResponse.success(res, 'Matching logistics companies retrieved.', freshMatches);
      }

      return ApiResponse.success(res, 'Matching logistics companies retrieved.', matches);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompanyController;
