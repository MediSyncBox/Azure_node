const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to get distinct medicines by user_id from today onwards
async function getMedicines(req, res) {
    const { userId } = req.params; // Get the user_id from request parameters
    const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);

        // Perform the SELECT operation
        let result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('today', sql.Date, today)
            .query('SELECT DISTINCT medicine FROM dbo.schedule WHERE user_id = @userId AND time >= @today ORDER BY medicine;');

        // Respond with the retrieved medicines
        res.status(200).json(result.recordset.map(item => item.medicine));
    } catch (err) {
        // Log and respond with the error message if there's an error
        console.error('SQL error:', err.message);
        res.status(500).send(err.message);
    }
}

router.get('/getMedicines/:userId', getMedicines);

module.exports = router;
