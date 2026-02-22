const express = require('express');
const router = express.Router();
const { getInventory, addTransaction, createItem, updateItem, getVendors } = require('./inventory.controller');
const { verifyToken } = require('../../../middleware/auth');

router.get('/', verifyToken, getInventory);
router.get('/vendors', verifyToken, getVendors);
router.post('/', verifyToken, createItem);
router.put('/:id', verifyToken, updateItem);
router.post('/transaction', verifyToken, addTransaction);

module.exports = router;
