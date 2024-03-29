const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to update a schedule by ID
async function updateSchedule(req, res) {
    const { id, medicine, dose, time, taken } = req.body; // Get the updated values from request body

    try {
        let pool = await sql.connect(dbConfig);

        let result = await pool.request()
            .input('id', sql.Int, id)
            .input('medicine', sql.NVarChar, medicine)
            .input('dose', sql.Int, dose)
            .input('time', sql.SmallDateTime, time)
            .input('taken', sql.Bit, taken)
            .query('UPDATE [dbo].[schedule] SET medicine = @medicine, dose = @dose, time = @time, taken = @taken WHERE id = @id;');

        res.status(200).json({ success: true, message: 'Schedule updated successfully.' });
    } catch (err) {
        console.error('Failed to update schedule:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}

router.post('/updateSchedule', updateSchedule);

module.exports = router;
