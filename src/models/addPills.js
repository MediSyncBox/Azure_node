const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();


async function addPills(req, res) {
    const { boxId, tankId, pillName, pillNumber } = req.body;
    try {
        let pool = await sql.connect(dbConfig);

        // Check if the tank exists for the given box
        const tankExists = await pool.request()
            .input('tankId', sql.Int, tankId)
            .input('boxId', sql.Int, boxId)
            .query('SELECT * FROM dbo.tank WHERE id = @tankId AND box_id = @boxId;');

        if (tankExists.recordset.length === 0) {
            return res.status(404).json({ message: 'Tank not found for the given box.' });
        }

        // Insert pill information into the tank
        const result = await pool.request()
            .input('boxId', sql.Int, boxId)
            .input('tankId', sql.Int, tankId)
            .input('pillName', sql.NVarChar, pillName)
            .input('pillNumber', sql.Int, pillNumber)
            .query('UPDATE dbo.tank SET pillName = @pillName, pillNumber = @pillNumber WHERE id = @tankId AND box_id = @boxId;');

        res.json({ message: 'Pill information successfully added to the tank.', result: result.recordset });

    } catch (err) {
        console.error('SQL error', err.message);
        res.status(500).json({ message: 'SQL error occurred: ' + err.message });
    }
}

router.post('/addPills', addPills);

module.exports = router;
