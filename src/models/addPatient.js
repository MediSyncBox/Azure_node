const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig'); // Make sure this path matches your actual dbConfig file

const router = express.Router();

async function addPatient (req, res) {
    const { userId, caregiverId } = req.body; // Assuming the client sends a userId and caregiverId in the request body

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);

        // Check if the user exists in the `users` table
        let userExists = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT COUNT(*) as count FROM [dbo].[users] WHERE id = @userId;');

        if (userExists.recordset[0].count === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Add a new entry to the `caregiver` table
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('caregiverId', sql.Int, caregiverId)
            .query('INSERT INTO [dbo].[caregiver] (user_id, caregiver_id) VALUES (@userId, @caregiverId);');

        res.status(200).send({ message: 'Patient added successfully' });
    } catch (err) {
        console.error('Failed to add patient:', err);
        res.status(500).send({ message: err.message });
    }
}
router.post('/addPatient', addPatient);
module.exports = router;
