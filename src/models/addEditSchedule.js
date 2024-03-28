const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to add or update a schedule
async function addEditSchedule(req, res) {
    const { id, userId, medicine, dose, time, taken } = req.body;

    try {
        let pool = await sql.connect(dbConfig);

        if (id) {
            // If an ID is provided, we update the existing record.
            await pool.request()
                .input('Id', sql.Int, id)
                .input('UserId', sql.Int, userId)
                .input('Medicine', sql.NVarChar, medicine)
                .input('Dose', sql.Int, dose)
                .input('Time', sql.SmallDateTime, new Date(time))
                .input('Taken', sql.Bit, taken)
                .query('UPDATE dbo.schedule SET medicine = @Medicine, dose = @Dose, time = @Time, taken = @Taken WHERE id = @Id;');
        } else {
            // If no ID is provided, we insert a new record.
            await pool.request()
                .input('UserId', sql.Int, userId)
                .input('Medicine', sql.NVarChar, medicine)
                .input('Dose', sql.Int, dose)
                .input('Time', sql.SmallDateTime, new Date(time))
                .input('Taken', sql.Bit, taken)
                .query('INSERT INTO dbo.schedule (user_id, medicine, dose, time, taken) VALUES (@UserId, @Medicine, @Dose, @Time, @Taken);');
        }

        res.json({ message: 'Schedule successfully processed.' });

    } catch (err) {
        console.error('Failed to process schedule:', err.message);
        res.status(500).json({ message: err.message });
    }
}

router.post('/addEditSchedule', addEditSchedule);

module.exports = router;
