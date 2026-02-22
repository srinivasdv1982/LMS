const { sql, poolPromise } = require('../../../config/db');

/**
 * Get all ads for the lodge
 */
const getAds = async (req, res) => {
    const { lodgeId } = req.user;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query(`
                SELECT AdId, Title, Link, ImageUrl, CreatedAt
                FROM Ads
                WHERE LodgeId = @lodgeId
                ORDER BY CreatedAt DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

/**
 * Create an ad
 */
const createAd = async (req, res) => {
    const { title, link, imageUrl } = req.body;
    const { lodgeId, userId } = req.user;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .input('title', sql.NVarChar, title)
            .input('link', sql.NVarChar, link)
            .input('imageUrl', sql.NVarChar, imageUrl)
            .input('createdBy', sql.Int, userId)
            .query(`
                INSERT INTO Ads (LodgeId, Title, Link, ImageUrl, CreatedBy)
                VALUES (@lodgeId, @title, @link, @imageUrl, @createdBy)
            `);
        res.json({ message: 'Ad created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getAds,
    createAd
};
