const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to delete a box associated with a user
async function deleteBox(req, res) {
    const { userId, boxId } = req.body;
    try {
        let pool = await sql.connect(dbConfig);

        // Check if the box is associated with the user
        const boxExists = await pool.request()
            .input('boxId', sql.Int, boxId)
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM dbo.user_box WHERE box_id = @boxId AND user_id = @userId;');

        if (boxExists.recordset.length === 0) {
            return res.status(404).json({ message: 'Box not found or not associated with user.' });
        }

        // If box exists, delete the entry
        await pool.request()
            .input('boxId', sql.Int, boxId)
            .input('userId', sql.Int, userId)
            .query('DELETE FROM dbo.user_box WHERE box_id = @boxId AND user_id = @userId;');

        res.json({ message: 'Box successfully deleted.' });
    } catch (err) {
        console.error('Failed to delete box:', err.message);
        res.status(500).json({ message: err.message });
    }
}

router.post('/deleteBox', deleteBox);

module.exports = router;
