const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to load boxes associated with a user
async function loadBoxes(req, res) {
    const { userId } = req.query; // Assuming you're passing userId as a query parameter

    try {
        let pool = await sql.connect(dbConfig);

        // Query to select boxes associated with the userId
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM dbo.user_box WHERE user_id = @userId;');

        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).json({ message: 'No boxes found for the user.' });
        }
    } catch (err) {
        console.error('Failed to load boxes:', err.message);
        res.status(500).json({ message: err.message });
    }
}

// Endpoint to load user boxes
router.get('/loadBoxes', loadBoxes);

module.exports = router;
