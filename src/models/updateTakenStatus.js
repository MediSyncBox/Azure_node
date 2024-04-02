const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// Function to update the taken status of a schedule
async function updateTakenStatus(req, res) {
    const { id, taken } = req.body; // Get the id and new taken status from the request body

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('id', sql.Int, id)
            .input('taken', sql.Bit, taken)
            .query('UPDATE [dbo].[schedule] SET taken = @taken WHERE id = @id;');

        res.status(200).send('Taken status updated successfully.');
    } catch (err) {
        console.error('Failed to update taken status:', err.message);
        res.status(500).send(err.message);
    }
}

router.post('/updateTakenStatus', updateTakenStatus);

module.exports = router;
