const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();


async function updateTakenStatusFromBox(req, res) {
  const { boxId } = req.params;
  const { tankId, medicineName, scheduledTime, taken } = req.body;

  try {
    let pool = await sql.connect(dbConfig);
    if (taken == 1) {
        const userBoxResult = await pool.request()
        .input('boxId', sql.Int, boxId)
        .query('SELECT user_id FROM dbo.user_box WHERE box_id = @boxId');

        if (userBoxResult.recordset.length > 0) {
            const userId = userBoxResult.recordset[0].user_id;

            // Query the schedule table to find the exact entry 
            const scheduleResult = await pool.request()
                .input('userId', sql.Int, userId)
                .input('medicineName', sql.VarChar, medicineName)
                .input('scheduledTime', sql.VarChar, scheduledTime)
                .query('SELECT * FROM dbo.schedule WHERE user_id = @userId AND medicineName = @medicineName AND scheduledTime = @scheduledTime');

            if (scheduleResult.recordset.length > 0) {
                // Matching entry found, update the taken field
                    await pool.request()
                        .input('boxId', sql.Int, boxId)
                        .input('medicineName', sql.VarChar, medicineName)
                        .input('scheduledTime', sql.VarChar, scheduledTime)
                        .input('taken', sql.Bit, taken)
                        .query('UPDATE dbo.schedule SET taken = 1 WHERE box_id = @boxId AND medicineName = @medicineName AND scheduledTime = @scheduledTime');

                    res.json({ message: 'Medicine marked as taken successfully' });

                    // update pillNumber in tank
                    const existingRecord = await pool.request()
                        .input('box_id', sql.Int, boxId)
                        .input('servo_id', sql.Int, tankId)
                        .query('SELECT * FROM [dbo].[tank] WHERE box_id = @box_id AND servo_id = @servo_id');

                    if (existingRecord.recordset.length > 0) {
                        const pillNumber = serBoxResult.recordset[0].pillNumber - 1;
                        // Update the existing record
                        await pool.request()
                            .input('box_id', sql.Int, boxId)
                            .input('servo_id', sql.Int, tankId)
                            .input('pillNumber', sql.Int, pillNumber)
                            .query('UPDATE dbo.tank SET pillNumber = @pillNumber WHERE box_id = @box_id AND servo_id = @servo_id');
                            
                        res.json({ message: 'All fields updated as successfully' });
                        }
            } else {
                res.status(404).json({ message: 'No matching medicine entry found' });
            }
        } else {
            console.error('SQL error:', err);
            res.status(500).json({ message: 'No matching user found' });
        }
    }
    else{
        console.error('SQL error:', err);
        res.status(500).json({ message: 'Nothing to update' });
    }
} catch (err) {
    console.error('SQL error', err.message);
    res.status(500).json({ message: 'SQL error occurred: ' + err.message });
}
}

router.post('/update-status/:boxId', updateTakenStatusFromBox);

module.exports = router;