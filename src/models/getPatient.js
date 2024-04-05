const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to get user IDs associated with a caregiver ID
async function getPatient(req, res) {
    const { caregiverId } = req.params; // Get the caregiver_id from request parameters

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);

        // Perform the SELECT operation
        let result = await pool.request()
            .input('caregiverId', sql.Int, caregiverId)
            .query('SELECT user_id FROM [dbo].[caregiver] WHERE caregiver_id = @caregiverId;');

        // Respond with the retrieved user IDs
        res.status(200).json(result.recordset);
    } catch (err) {
        // Log and respond with the error message if there's an error
        console.error('Failed to get user IDs:', err.message);
        res.status(500).send(err.message);
    }
}

// Route to get user IDs for a caregiver
router.get('/getPatient/:caregiverId', getPatient);

module.exports = router;
