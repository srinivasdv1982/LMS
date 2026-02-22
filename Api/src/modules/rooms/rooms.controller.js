const { sql, poolPromise } = require('../../../config/db');

const getAllRooms = async (req, res) => {
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query(`
        SELECT r.RoomId, r.RoomNumber, r.RoomType, r.Status, r.FloorId, f.FloorName, f.FloorNumber
        FROM Rooms r
        JOIN Floors f ON r.FloorId = f.FloorId
        WHERE r.LodgeId = @lodgeId
        ORDER BY f.FloorNumber, r.RoomNumber
      `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getFloors = async (req, res) => {
    const { lodgeId } = req.user;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT FloorId, FloorName, FloorNumber FROM Floors WHERE LodgeId = @lodgeId AND IsActive = 1 ORDER BY FloorNumber');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createRoom = async (req, res) => {
    const { roomNumber, floorId, roomType, status } = req.body;
    const { lodgeId } = req.user;

    if (!roomNumber || !floorId) {
        return res.status(400).json({ message: 'Room number and floor are required.' });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .input('roomNumber', sql.NVarChar, roomNumber)
            .input('floorId', sql.Int, floorId)
            .input('roomType', sql.NVarChar, roomType || null)
            .input('status', sql.NVarChar, status || 'Available')
            .query('INSERT INTO Rooms (LodgeId, RoomNumber, FloorId, RoomType, Status) VALUES (@lodgeId, @roomNumber, @floorId, @roomType, @status)');
        res.status(201).json({ message: 'Room created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { roomNumber, floorId, roomType, status } = req.body;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        const check = await pool.request()
            .input('roomId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT RoomId FROM Rooms WHERE RoomId = @roomId AND LodgeId = @lodgeId');
        if (check.recordset.length === 0) return res.status(404).json({ message: 'Room not found.' });

        await pool.request()
            .input('roomId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .input('roomNumber', sql.NVarChar, roomNumber)
            .input('floorId', sql.Int, floorId)
            .input('roomType', sql.NVarChar, roomType || null)
            .input('status', sql.NVarChar, status)
            .query('UPDATE Rooms SET RoomNumber = @roomNumber, FloorId = @floorId, RoomType = @roomType, Status = @status WHERE RoomId = @roomId AND LodgeId = @lodgeId');
        res.json({ message: 'Room updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteRoom = async (req, res) => {
    const { id } = req.params;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        const check = await pool.request()
            .input('roomId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT RoomId, Status FROM Rooms WHERE RoomId = @roomId AND LodgeId = @lodgeId');
        if (check.recordset.length === 0) return res.status(404).json({ message: 'Room not found.' });
        if (check.recordset[0].Status === 'Occupied') return res.status(400).json({ message: 'Cannot delete an occupied room.' });

        await pool.request()
            .input('roomId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .query('DELETE FROM Rooms WHERE RoomId = @roomId AND LodgeId = @lodgeId');
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateRoomStatus = async (req, res) => {
    const { roomId, status } = req.body;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('roomId', sql.Int, roomId)
            .input('lodgeId', sql.Int, lodgeId)
            .input('status', sql.NVarChar, status)
            .query('UPDATE Rooms SET Status = @status WHERE RoomId = @roomId AND LodgeId = @lodgeId');
        res.json({ message: 'Room status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllRooms, getFloors, createRoom, updateRoom, deleteRoom, updateRoomStatus };
