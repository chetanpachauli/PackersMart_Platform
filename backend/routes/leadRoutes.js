const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');
const CompanyController = require('../controllers/companyController');
const { validateLeadSubmission } = require('../middlewares/validateLead');

// 1. Create Lead
router.post('/', validateLeadSubmission, LeadController.createLead);

// 2. Verify OTP
router.post('/:id/verify-otp', LeadController.verifyOtp);

// 3. Get All Leads (with status filter query parameter)
router.get('/', LeadController.getAllLeads);

// 4. Get Lead Details by ID
router.get('/:id', LeadController.getLeadById);

// 5. Update Lead Status
router.patch('/:id/status', LeadController.updateLeadStatus);

// 6. Get Matching Companies for a Verified Lead
router.get('/:id/matching-companies', CompanyController.getMatchingCompanies);

module.exports = router;
