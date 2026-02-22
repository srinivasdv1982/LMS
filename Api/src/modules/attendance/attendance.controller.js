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
            await pool.request()
                .input('lodgeId', sql.Int, lodgeId)
                .input('employeeId', sql.Int, record.employeeId)
                .input('date', sql.Date, date)
                .input('status', sql.NVarChar, record.status)
                .query(`
                    IF EXISTS (SELECT 1 FROM EmployeeAttendance WHERE EmployeeId = @employeeId AND AttendanceDate = @date)
                    BEGIN
                        UPDATE EmployeeAttendance SET Status = @status 
                        WHERE EmployeeId = @employeeId AND AttendanceDate = @date
                    END
                    ELSE
                    BEGIN
                        INSERT INTO EmployeeAttendance (LodgeId, EmployeeId, AttendanceDate, Status)
                        VALUES (@lodgeId, @employeeId, @date, @status)
                    END
                `);
        }

        res.json({ message: 'Attendance saved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getAttendanceByDate,
    saveBatchAttendance
};
