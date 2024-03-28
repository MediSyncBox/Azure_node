const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

async function addBox(req, res) {
    const { userId, boxId, name } = req.body;

    try {
        let pool = await sql.connect(dbConfig);

        // Check if the box exists
        const boxExists = await pool.request()
            .input('boxId', sql.Int, boxId)
            .query('SELECT * FROM dbo.box WHERE id = @boxId;');

        if (boxExists.recordset.length === 0) {
            return res.status(404).json({ message: 'Box not found.' });
        }

        // Insert a new entry in the user_box table, including the name column
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('boxId', sql.Int, boxId)
            .input('name', sql.NVarChar, name)
            // Ensure the column names match your database schema
            .query('INSERT INTO dbo.user_box (user_id, box_id, name) VALUES (@userId, @boxId, @name);');

        res.json({ message: 'Box successfully added to user with name.' });

        // const schemaInfo = await pool.request().query('SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = \'user_box\'');
        // console.log(schemaInfo.recordset);

    } catch (err) {
        console.error('Failed to add box to user with name:', err.message);
        res.status(500).json({ message: err.message });
    }
}

router.post('/addBox', addBox);

module.exports = router;
