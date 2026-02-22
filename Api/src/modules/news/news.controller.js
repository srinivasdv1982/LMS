const { sql, poolPromise } = require('../../../config/db');

/**
 * Get all news for the lodge
 */
const getNews = async (req, res) => {
    const { lodgeId } = req.user;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query(`
                SELECT n.NewsId, n.Title, n.Content, n.ImageUrl, n.CreatedAt, 
                       e.FirstName + ' ' + ISNULL(e.LastName, '') as CreatedByName
                FROM News n
                JOIN Employees e ON n.CreatedBy = e.EmployeeId
                WHERE n.LodgeId = @lodgeId
                ORDER BY n.CreatedAt DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

/**
 * Create a news item
 */
const createNews = async (req, res) => {
    const { title, content, imageUrl } = req.body;
    const { lodgeId, userId } = req.user;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .input('title', sql.NVarChar, title)
            .input('content', sql.NVarChar, content)
            .input('imageUrl', sql.NVarChar, imageUrl)
            .input('createdBy', sql.Int, userId)
            .query(`
                INSERT INTO News (LodgeId, Title, Content, ImageUrl, CreatedBy)
                VALUES (@lodgeId, @title, @content, @imageUrl, @createdBy)
            `);
        res.json({ message: 'News item created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getNews,
    createNews
};
