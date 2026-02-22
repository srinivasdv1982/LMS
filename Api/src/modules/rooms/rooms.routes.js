const express = require('express');
const router = express.Router();
const { getAllRooms, getFloors, createRoom, updateRoom, deleteRoom, updateRoomStatus } = require('./rooms.controller');
const { verifyToken } = require('../../../middleware/auth');

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms for the logged-in lodge
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, getAllRooms);
router.get('/floors', verifyToken, getFloors);
router.post('/', verifyToken, createRoom);
router.put('/:id', verifyToken, updateRoom);
router.delete('/:id', verifyToken, deleteRoom);
router.patch('/status', verifyToken, updateRoomStatus);

module.exports = router;
