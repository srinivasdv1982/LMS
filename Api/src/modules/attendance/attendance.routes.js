const express = require('express');
const router = express.Router();
const { getAttendanceByDate, saveBatchAttendance, getMonthlyAttendance } = require('./attendance.controller');
const { verifyToken } = require('../../../middleware/auth');

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get attendance for a specific date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, getAttendanceByDate);

/**
 * @swagger
 * /attendance/batch:
 *   post:
 *     summary: Save batch attendance for multiple employees
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/batch', verifyToken, saveBatchAttendance);

/**
 * @swagger
 * /attendance/monthly:
 *   get:
 *     summary: Get monthly attendance matrix
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monthly', verifyToken, getMonthlyAttendance);

module.exports = router;
