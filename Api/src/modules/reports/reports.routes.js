const express = require('express');
const router = express.Router();
const { getLodgeReport, getDashboardSummary } = require('./reports.controller');
const { verifyToken } = require('../../../middleware/auth');

/**
 * @swagger
 * /reports/lodge-summary:
 *   get:
 *     summary: Get a summary report for the lodge
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/lodge-summary', verifyToken, getLodgeReport);

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Get dashboard KPIs and recent activity
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', verifyToken, getDashboardSummary);

module.exports = router;
