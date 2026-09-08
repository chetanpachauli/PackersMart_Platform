const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

// GET /api/dashboard - Aggregated Dashboard Statistics
router.get('/', DashboardController.getDashboardStats);

module.exports = router;
