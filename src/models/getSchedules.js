const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to get schedules by user_id
async function getSchedules(req, res) {
    const { userId } = req.params; // Get the user_id from request parameters

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);

        // Perform the SELECT operation
        let result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM [dbo].[schedule] WHERE user_id = @userId ORDER BY time;');

        // Respond with the retrieved schedules
        res.status(200).json(result.recordset);
    } catch (err) {
        // Log and respond with the error message if there's an error
        console.error('Failed to get schedules:', err.message);
        res.status(500).send(err.message);
    }
}

router.get('/getSchedules/:userId', getSchedules);

module.exports = router;
