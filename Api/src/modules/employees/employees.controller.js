const { sql, poolPromise } = require('../../../config/db');

const getAllEmployees = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ message: 'Database connecting failed.' });
        }

        const result = await pool.request()
            .input('lodgeId', sql.Int, req.user.lodgeId)
            .query(`
                SELECT e.EmployeeId, e.EmployeeCode, e.FirstName, e.LastName, e.Phone, e.Email, r.RoleName, e.Salary, e.JoinDate, e.IsActive
                FROM Employees e
                JOIN Roles r ON e.RoleId = r.RoleId
                WHERE e.LodgeId = @lodgeId
                ORDER BY e.FirstName
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getRoles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT RoleId, RoleName FROM Roles');
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const createEmployee = async (req, res) => {
    const { firstName, lastName, phone, email, roleId, salary, joinDate } = req.body;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;

        // Generate a new EmployeeCode
        const codeResult = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query(`
                SELECT COUNT(*) as count 
                FROM Employees 
                WHERE LodgeId = @lodgeId
            `);
        const newCodeNumber = codeResult.recordset[0].count + 1;
        const employeeCode = `EMP${lodgeId}-${newCodeNumber}`;

        await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .input('employeeCode', sql.NVarChar, employeeCode)
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName || null)
            .input('phone', sql.NVarChar, phone || null)
            .input('email', sql.NVarChar, email || null)
            .input('roleId', sql.Int, roleId)
            .input('salary', sql.Decimal, salary || 0)
            .input('joinDate', sql.Date, joinDate || new Date())
            .query(`
                INSERT INTO Employees (LodgeId, EmployeeCode, FirstName, LastName, Phone, Email, RoleId, Salary, JoinDate)
                VALUES (@lodgeId, @employeeCode, @firstName, @lastName, @phone, @email, @roleId, @salary, @joinDate)
            `);

        res.status(201).json({ message: 'Employee created successfully', employeeCode });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error creating employee' });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, email, roleId, salary, joinDate, isActive } = req.body;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;

        // Verify employee exists and belongs to lodge
        const checkResult = await pool.request()
            .input('employeeId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT EmployeeId FROM Employees WHERE EmployeeId = @employeeId AND LodgeId = @lodgeId');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        // Update employee
        await pool.request()
            .input('employeeId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName || null)
            .input('phone', sql.NVarChar, phone || null)
            .input('email', sql.NVarChar, email || null)
            .input('roleId', sql.Int, roleId)
            .input('salary', sql.Decimal, salary || 0)
            .input('joinDate', sql.Date, joinDate)
            .input('isActive', sql.Bit, isActive !== undefined ? isActive : 1)
            .query(`
                UPDATE Employees
                SET FirstName = @firstName,
                    LastName = @lastName,
                    Phone = @phone,
                    Email = @email,
                    RoleId = @roleId,
                    Salary = @salary,
                    JoinDate = @joinDate,
                    IsActive = @isActive
                WHERE EmployeeId = @employeeId AND LodgeId = @lodgeId
            `);

        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        console.error('Error updating employee:', err.message);
        res.status(500).json({ message: 'Failed to update employee' });
    }
};

module.exports = {
    getAllEmployees,
    getRoles,
    createEmployee,
    updateEmployee
};
