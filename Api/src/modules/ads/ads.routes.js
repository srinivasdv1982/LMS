const express = require('express');
const router = express.Router();
const { getAds, createAd } = require('./ads.controller');
const { verifyToken } = require('../../../middleware/auth');

/**
 * @swagger
 * /ads:
 *   get:
 *     summary: Get all ads for the lodge
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, getAds);

/**
 * @swagger
 * /ads:
 *   post:
 *     summary: Create an advertisement
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, createAd);

module.exports = router;
