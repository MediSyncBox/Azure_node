const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

async function addBox(req, res) {
    const { userId, boxId, name, isUserOwnBox } = req.body;
    try {
        let pool = await sql.connect(dbConfig);

        // Check if the box is associated with the user
        const boxExists = await pool.request()
            .input('boxId', sql.Int, boxId)
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM dbo.user_box WHERE box_id = @boxId AND user_id = @userId;');

        if (boxExists.recordset.length > 0) {
            // Box exists, update the existing entry
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('boxId', sql.Int, boxId)
                .input('name', sql.NVarChar, name)
                .input('isUserOwnBox', sql.Bit, isUserOwnBox)
                .query('UPDATE dbo.user_box SET name = @name, IsUserOwnBox = @isUserOwnBox WHERE box_id = @boxId AND user_id = @userId;');
            
            return res.json({ message: 'Box info updated successfully.' });
        } else {
            // Box does not exist, add new entry
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('boxId', sql.Int, boxId)
                .input('name', sql.NVarChar, name)
                .input('isUserOwnBox', sql.Bit, isUserOwnBox)
                .query('INSERT INTO dbo.user_box (user_id, box_id, name, IsUserOwnBox) VALUES (@userId, @boxId, @name, @isUserOwnBox);');

            return res.json({ message: 'New box successfully added to user.' });
        }
    } catch (err) {
        console.error('Failed to modify or add box:', err.message);
        res.status(500).json({ message: err.message });
    }
}

router.post('/addBox', addBox);

module.exports = router;
