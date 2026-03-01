const { sql, poolPromise } = require('../../../config/db');
const bcrypt = require('bcryptjs');

// Get all mapped users
const getAllUsers = async (req, res) => {
    try {
        const payloadLodgeId = req.user.lodgeId;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, payloadLodgeId)
            .query(`
                SELECT 
                    u.UserId, 
                    u.Username, 
                    u.IsActive, 
                    u.LastLoginAt,
                    e.EmployeeId,
                    e.EmployeeCode, 
                    e.FirstName, 
                    e.LastName, 
                    r.RoleName
                FROM Users u
                JOIN Employees e ON u.EmployeeId = e.EmployeeId
                JOIN Roles r ON e.RoleId = r.RoleId
                WHERE u.LodgeId = @lodgeId
                ORDER BY u.UserId DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get employees who do not have a user account yet
const getUnmappedEmployees = async (req, res) => {
    try {
        const payloadLodgeId = req.user.lodgeId;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, payloadLodgeId)
            .query(`
                SELECT 
                    e.EmployeeId, 
                    e.EmployeeCode, 
                    e.FirstName, 
                    e.LastName, 
                    r.RoleName
                FROM Employees e
                JOIN Roles r ON e.RoleId = r.RoleId
                LEFT JOIN Users u ON e.EmployeeId = u.EmployeeId
                WHERE e.LodgeId = @lodgeId AND u.UserId IS NULL
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Create user account for an employee
const createUser = async (req, res) => {
    const { employeeId, username, password } = req.body;
    try {
        const payloadLodgeId = req.user.lodgeId;
        const pool = await poolPromise;

        // Check if username exists
        const checkUser = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT UserId FROM Users WHERE Username = @username');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.request()
            .input('lodgeId', sql.Int, payloadLodgeId)
            .input('employeeId', sql.Int, employeeId)
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Users (LodgeId, EmployeeId, Username, PasswordHash, IsActive)
                VALUES (@lodgeId, @employeeId, @username, @password, 1)
            `);

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Toggle user Active status
const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;

        // Get current status
        const userStatus = await pool.request()
            .input('userId', sql.Int, id)
            .query('SELECT IsActive FROM Users WHERE UserId = @userId');

        if (userStatus.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newStatus = userStatus.recordset[0].IsActive ? 0 : 1;

        await pool.request()
            .input('userId', sql.Int, id)
            .input('status', sql.Bit, newStatus)
            .query('UPDATE Users SET IsActive = @status WHERE UserId = @userId');

        res.json({ message: 'User status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        const pool = await poolPromise;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.request()
            .input('userId', sql.Int, id)
            .input('password', sql.NVarChar, hashedPassword)
            .query('UPDATE Users SET PasswordHash = @password WHERE UserId = @userId');

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAllUsers,
    getUnmappedEmployees,
    createUser,
    toggleUserStatus,
    resetPassword
};
