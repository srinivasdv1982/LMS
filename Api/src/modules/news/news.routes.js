const express = require('express');
const router = express.Router();
const { getNews, createNews } = require('./news.controller');
const { verifyToken } = require('../../../middleware/auth');

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news for the lodge
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, getNews);

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a news item
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, createNews);

module.exports = router;
