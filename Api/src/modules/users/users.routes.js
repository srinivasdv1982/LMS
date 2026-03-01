const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../../middleware/auth');
const {
    getAllUsers,
    getUnmappedEmployees,
    createUser,
    toggleUserStatus,
    resetPassword
} = require('./users.controller');

// Admin-only middleware could be added here if defined later
// For now, it relies on frontend filtering or a custom middleware to verify role=Admin

router.get('/', verifyToken, getAllUsers);
router.get('/unmapped', verifyToken, getUnmappedEmployees);
router.post('/', verifyToken, createUser);
router.put('/:id/toggle-status', verifyToken, toggleUserStatus);
router.put('/:id/reset-password', verifyToken, resetPassword);

module.exports = router;
