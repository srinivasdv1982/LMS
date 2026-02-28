const { sql, poolPromise } = require('../../../config/db');

const getLodgeReport = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { lodgeId } = req.user;

        // Total Rooms
        const roomsResult = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT COUNT(*) as TotalRooms FROM Rooms WHERE LodgeId = @lodgeId');

        // Occupied Rooms (Simplified for this project: any room that is NOT 'Available')
        const occupiedResult = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query("SELECT COUNT(*) as OccupiedRooms FROM Rooms WHERE LodgeId = @lodgeId AND Status != 'Available'");

        // Employee Count
        const empResult = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT COUNT(*) as TotalEmployees FROM Employees WHERE LodgeId = @lodgeId');

        res.json({
            totalRooms: roomsResult.recordset[0].TotalRooms,
            occupiedRooms: occupiedResult.recordset[0].OccupiedRooms,
            totalEmployees: empResult.recordset[0].TotalEmployees,
            occupancyRate: roomsResult.recordset[0].TotalRooms > 0
                ? ((occupiedResult.recordset[0].OccupiedRooms / roomsResult.recordset[0].TotalRooms) * 100).toFixed(2) + '%'
                : '0%'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getDashboardSummary = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { lodgeId } = req.user;

        // Fetch KPI Metrics
        const kpiResult = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query(`
                SELECT 
                    (SELECT COUNT(*) FROM Rooms WHERE LodgeId = @lodgeId) as TotalRooms,
                    (SELECT COUNT(*) FROM Rooms WHERE LodgeId = @lodgeId AND Status != 'Available') as OccupiedRooms,
                    (SELECT COUNT(*) FROM InventoryItems WHERE LodgeId = @lodgeId AND CurrentStock <= ReorderLevel) as LowStockCount
            `);

        // Fetch Recent Housekeeping Tasks for Today
        const hkResult = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query(`
                SELECT h.TaskId, r.RoomNumber, h.Status, CONCAT(e.FirstName, ' ', IFNULL(e.LastName, '')) as EmployeeName
                FROM HousekeepingTasks h
                JOIN Rooms r ON h.RoomId = r.RoomId
                JOIN Employees e ON h.AssignedTo = e.EmployeeId
                WHERE h.LodgeId = @lodgeId AND h.TaskDate = CAST(NOW() AS DATE)
                ORDER BY h.CreatedAt DESC
                LIMIT 5
            `);

        // Fetch Recent Inventory Transactions
        const invResult = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query(`
                SELECT t.TransactionId, i.ItemName, t.TransactionType, t.Quantity, t.TransactionDate
                FROM InventoryTransactions t
                JOIN InventoryItems i ON t.InventoryItemId = i.InventoryItemId
                WHERE i.LodgeId = @lodgeId
                ORDER BY t.TransactionDate DESC
                LIMIT 5
            `);

        res.json({
            kpis: kpiResult.recordset[0],
            recentHousekeeping: hkResult.recordset,
            recentInventory: invResult.recordset
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { getLodgeReport, getDashboardSummary };
