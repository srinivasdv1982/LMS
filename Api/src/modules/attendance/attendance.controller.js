const { sql, poolPromise } = require('../../../config/db');

/**
 * Get attendance for all employees of a lodge for a specific date
 */
const getAttendanceByDate = async (req, res) => {
    const { date } = req.query;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .input('date', sql.Date, date || new Date())
            .query(`
                SELECT e.EmployeeId, e.FirstName, e.LastName, r.RoleName,
                       ISNULL(a.Status, 'Present') as Status,
                       a.AttendanceId
                FROM Employees e
                JOIN Roles r ON e.RoleId = r.RoleId
                LEFT JOIN EmployeeAttendance a ON e.EmployeeId = a.EmployeeId 
                    AND a.AttendanceDate = @date
                WHERE e.LodgeId = @lodgeId AND e.IsActive = 1
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

/**
 * Save/Update batch attendance
 */
const saveBatchAttendance = async (req, res) => {
    const { attendances, date } = req.body; // Array of { employeeId, status }
    const { lodgeId } = req.user;

    try {
        const targetDate = new Date(date);
        const now = new Date();
        const diffDays = (now.getTime() - targetDate.getTime()) / (1000 * 3600 * 24);

        if (diffDays > 15) {
            return res.status(400).json({ message: 'Cannot edit attendance older than 15 days.' });
        }

        const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (targetDateOnly > todayOnly) {
            return res.status(400).json({ message: 'Cannot mark attendance for future dates.' });
        }

        const pool = await poolPromise;

        for (const record of attendances) {
            // Check if exists
            const check = await pool.request()
                .input('employeeId', sql.Int, record.employeeId)
                .input('date', sql.Date, date)
                .query('SELECT AttendanceId FROM EmployeeAttendance WHERE EmployeeId = @employeeId AND AttendanceDate = @date');

            if (check.recordset.length > 0) {
                await pool.request()
                    .input('employeeId', sql.Int, record.employeeId)
                    .input('date', sql.Date, date)
                    .input('status', sql.NVarChar, record.status)
                    .query('UPDATE EmployeeAttendance SET Status = @status WHERE EmployeeId = @employeeId AND AttendanceDate = @date');
            } else {
                await pool.request()
                    .input('lodgeId', sql.Int, lodgeId)
                    .input('employeeId', sql.Int, record.employeeId)
                    .input('date', sql.Date, date)
                    .input('status', sql.NVarChar, record.status)
                    .query('INSERT INTO EmployeeAttendance (LodgeId, EmployeeId, AttendanceDate, Status) VALUES (@lodgeId, @employeeId, @date, @status)');
            }
        }

        res.json({ message: 'Attendance saved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

/**
 * Get monthly attendance for all employees of a lodge
 */
const getMonthlyAttendance = async (req, res) => {
    const { month, year } = req.query; // Expecting month (1-12) and year (e.g., 2024)
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .query(`
                SELECT e.EmployeeId, e.FirstName, e.LastName, r.RoleName,
                       a.AttendanceDate, a.Status
                FROM Employees e
                JOIN Roles r ON e.RoleId = r.RoleId
                LEFT JOIN EmployeeAttendance a ON e.EmployeeId = a.EmployeeId 
                    AND MONTH(a.AttendanceDate) = @month 
                    AND YEAR(a.AttendanceDate) = @year
                WHERE e.LodgeId = @lodgeId AND e.IsActive = 1
                ORDER BY e.EmployeeId, a.AttendanceDate
            `);

        // Group by employee
        const employeesMap = {};
        result.recordset.forEach(row => {
            if (!employeesMap[row.EmployeeId]) {
                employeesMap[row.EmployeeId] = {
                    EmployeeId: row.EmployeeId,
                    FirstName: row.FirstName,
                    LastName: row.LastName,
                    RoleName: row.RoleName,
                    attendance: {}
                };
            }
            if (row.AttendanceDate) {
                const day = new Date(row.AttendanceDate).getDate();
                employeesMap[row.EmployeeId].attendance[day] = row.Status;
            }
        });

        res.json(Object.values(employeesMap));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getAttendanceByDate,
    saveBatchAttendance,
    getMonthlyAttendance
};
