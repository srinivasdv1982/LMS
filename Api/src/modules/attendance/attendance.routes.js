const express = require('express');
const router = express.Router();
const { getAttendanceByDate, saveBatchAttendance, getMonthlyAttendance, updateSingleAttendance, bulkMarkPresent } = require('./attendance.controller');
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

/**
 * @swagger
 * /attendance/update:
 *   post:
 *     summary: Update a single employee's attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/update', verifyToken, updateSingleAttendance);

/**
 * @swagger
 * /attendance/bulk-present:
 *   post:
 *     summary: Bulk mark present for missing attendance in a month
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk-present', verifyToken, bulkMarkPresent);

module.exports = router;
