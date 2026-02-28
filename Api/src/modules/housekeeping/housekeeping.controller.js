const { sql, poolPromise } = require('../../../config/db');

const getHousekeepingTasks = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ message: 'Database connecting failed.' });
        }

        const dateFilter = req.query.date || new Date().toISOString().split('T')[0];

        const result = await pool.request()
            .input('lodgeId', sql.Int, req.user.lodgeId)
            .input('taskDate', sql.Date, dateFilter)
            .query(`
                SELECT h.TaskId, h.RoomId, r.RoomNumber, h.AssignedTo, CONCAT(e.FirstName, ' ', IFNULL(e.LastName, '')) as EmployeeName, h.Status, h.TaskDate as CreatedAt
                FROM HousekeepingTasks h
                JOIN Rooms r ON h.RoomId = r.RoomId
                JOIN Employees e ON h.AssignedTo = e.EmployeeId
                WHERE h.LodgeId = @lodgeId AND h.TaskDate = @taskDate
                ORDER BY h.CreatedAt DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const updateTaskStatus = async (req, res) => {
    const { taskId, status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('taskId', sql.Int, taskId)
            .input('status', sql.NVarChar, status)
            .query('UPDATE HousekeepingTasks SET Status = @status WHERE TaskId = @taskId');

        res.json({ message: 'Task status updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const createHousekeepingTask = async (req, res) => {
    const { roomId, assignedTo, taskDate } = req.body;
    try {
        const pool = await poolPromise;
        const date = taskDate || new Date().toISOString().split('T')[0];

        // Check if a task already exists for this room on this date
        const checkResult = await pool.request()
            .input('lodgeId', sql.Int, req.user.lodgeId)
            .input('roomId', sql.Int, roomId)
            .input('taskDate', sql.Date, date)
            .query(`
                SELECT TaskId FROM HousekeepingTasks 
                WHERE LodgeId = @lodgeId AND RoomId = @roomId AND TaskDate = @taskDate
            `);

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ message: 'A housekeeping task is already assigned for this room on this date.' });
        }

        await pool.request()
            .input('lodgeId', sql.Int, req.user.lodgeId)
            .input('roomId', sql.Int, roomId)
            .input('assignedTo', sql.Int, assignedTo)
            .input('taskDate', sql.Date, date)
            .query(`
                INSERT INTO HousekeepingTasks (LodgeId, RoomId, AssignedTo, Status, TaskDate)
                VALUES (@lodgeId, @roomId, @assignedTo, 'Pending', @taskDate)
            `);

        res.status(201).json({ message: 'Housekeeping task assigned successfully' });
    } catch (err) {
        console.error('Error creating task:', err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getHousekeepingTasks,
    updateTaskStatus,
    createHousekeepingTask
};
