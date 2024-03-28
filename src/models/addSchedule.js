const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');

const router = express.Router();

// Function to add a schedule
async function addSchedule(req, res) {
    const { userId, medicine, dose, time, taken } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('UserId', sql.Int, userId)
            .input('Medicine', sql.NVarChar, medicine)
            .input('Dose', sql.Int, dose)
            .input('Time', sql.SmallDateTime, time)
            .input('Taken', sql.Bit, taken)
            .query('INSERT INTO dbo.schedule (user_id, medicine, dose, time, taken) VALUES (@UserId, @Medicine, @Dose, @Time, @Taken);');

        res.json({ message: 'Schedule successfully added.' });
    } catch (err) {
        console.error('Failed to add schedule:', err.message);
        res.status(500).json({ message: err.message });
    }
}

router.post('/addSchedule', addSchedule);

module.exports = router;
