const { sql, poolPromise } = require('../../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await poolPromise;

        if (!pool) {
            return res.status(503).json({ message: 'Database connecting failed. Please check server configuration.' });
        }

        // Joint query to get user, employee role and lodge info
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
        SELECT u.UserId, u.PasswordHash, u.LodgeId, l.LodgeName, e.FirstName, r.RoleName
        FROM Users u
        JOIN Employees e ON u.EmployeeId = e.EmployeeId
        JOIN Roles r ON e.RoleId = r.RoleId
        JOIN Lodges l ON u.LodgeId = l.LodgeId
        WHERE u.Username = @username AND u.IsActive = 1
      `);

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash.trim());
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            id: user.UserId,
            lodgeId: user.LodgeId,
            lodgeName: user.LodgeName,
            name: user.FirstName,
            role: user.RoleName
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.UserId,
                        name: user.FirstName,
                        role: user.RoleName,
                        lodgeId: user.LodgeId,
                        lodgeName: user.LodgeName
                    }
                });
            }
        );

        // Update last login
        await pool.request()
            .input('userId', sql.Int, user.UserId)
            .query('UPDATE Users SET LastLoginAt = GETDATE() WHERE UserId = @userId');

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { login };
