const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to get user info associated with a caregiver ID
async function getPatient(req, res) {
    const { caregiverId } = req.params; // Get the caregiver_id from request parameters

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);

        // Perform the SELECT operation with JOIN to get usernames
        let result = await pool.request()
            .input('caregiverId', sql.Int, caregiverId)
            .query('SELECT u.id, u.userName FROM [dbo].[users] u ' +
                   'JOIN [dbo].[caregiver] c ON u.id = c.user_id ' +
                   'WHERE c.caregiver_id = @caregiverId;');

        // Respond with the retrieved user IDs and usernames
        res.status(200).json(result.recordset);
    } catch (err) {
        // Log and respond with the error message if there's an error
        console.error('Failed to get patients:', err.message);
        res.status(500).send(err.message);
    }
}

// Route to get user info for a caregiver
router.get('/getPatient/:caregiverId', getPatient);

module.exports = router;
