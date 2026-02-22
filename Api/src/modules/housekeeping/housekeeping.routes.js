const express = require('express');
const router = express.Router();
const { getHousekeepingTasks, updateTaskStatus, createHousekeepingTask } = require('./housekeeping.controller');
const { verifyToken } = require('../../../middleware/auth');

/**
 * @swagger
 * /housekeeping:
 *   get:
 *     summary: Get all housekeeping tasks for the lodge
 *     tags: [Housekeeping]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, getHousekeepingTasks);

/**
 * @swagger
 * /housekeeping/status:
 *   patch:
 *     summary: Update housekeeping task status
 *     tags: [Housekeeping]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/status', verifyToken, updateTaskStatus);

/**
 * @swagger
 * /housekeeping:
 *   post:
 *     summary: Assign a new housekeeping task
 *     tags: [Housekeeping]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, createHousekeepingTask);

module.exports = router;
