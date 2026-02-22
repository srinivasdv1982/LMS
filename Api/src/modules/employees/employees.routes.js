const express = require('express');
const router = express.Router();
const { getAllEmployees, getRoles, createEmployee, updateEmployee } = require('./employees.controller');
const { verifyToken } = require('../../../middleware/auth');

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees for the lodge
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, getAllEmployees);

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee for the lodge
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, createEmployee);

/**
 * @swagger
 * /employees/roles:
 *   get:
 *     summary: Get all available roles
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get('/roles', verifyToken, getRoles);
/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update an existing employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verifyToken, updateEmployee);

module.exports = router;
