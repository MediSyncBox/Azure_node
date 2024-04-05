const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');

const router = express.Router();

async function addPatient(req, res) {
    const { userId, caregiverId } = req.body;

    try {
        let pool = await sql.connect(dbConfig);

        let userExists = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT COUNT(*) as count FROM [dbo].[users] WHERE id = @userId;');

        if (userExists.recordset[0].count === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        await pool.request()
            .input('userId', sql.Int, userId)
            .input('caregiverId', sql.Int, caregiverId)
            .query('INSERT INTO [dbo].[caregiver] (user_id, caregiver_id) VALUES (@userId, @caregiverId);');

        // After inserting, fetch the patient's info to return it
        const patientInfo = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT u.id, u.userName FROM [dbo].[users] u ' +
            'JOIN [dbo].[caregiver] c ON u.id = c.user_id ' +
            'WHERE c.caregiver_id = @caregiverId;'); // Adjust SELECT based on your schema

        if (patientInfo.recordset.length > 0) {
            res.status(200).send(patientInfo.recordset[0]); // Send the patient's information back
        } else {
            // This case should theoretically never hit since you've already checked if the user exists
            res.status(404).send({ message: 'Newly added patient info not found' });
        }
    } catch (err) {
        console.error('Failed to add patient:', err);
        res.status(500).send({ message: err.message });
    }
}

router.post('/addPatient', addPatient);
module.exports = router;
