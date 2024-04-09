const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function updateMedicineTaken(req, res) {
  const { boxId, tankId, medicineName, scheduledTime } = req.body;

  try {
    let pool = await sql.connect(dbConfig);

    // Query the medicine table to find the matching entry
    const result = await pool.request()
      .input('boxId', sql.Int, boxId)
      .input('tankId', sql.Int, tankId)
      .input('medicineName', sql.VarChar, medicineName)
      .input('scheduledTime', sql.VarChar, scheduledTime)
      .query('SELECT * FROM dbo.medicine WHERE box_id = @boxId AND tank_id = @tankId AND medicine_name = @medicineName AND scheduled_time = @scheduledTime');

    if (result.recordset.length > 0) {
      // Matching entry found, update the taken field
      await pool.request()
        .input('boxId', sql.Int, boxId)
        .input('tankId', sql.Int, tankId)
        .input('medicineName', sql.VarChar, medicineName)
        .input('scheduledTime', sql.VarChar, scheduledTime)
        .query('UPDATE dbo.medicine SET taken = 1 WHERE box_id = @boxId AND tank_id = @tankId AND medicine_name = @medicineName AND scheduled_time = @scheduledTime');

      res.json({ message: 'Medicine marked as taken successfully' });
    } else {
      res.status(404).json({ message: 'No matching medicine entry found' });
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

router.post('/updateMedicineTaken', updateMedicineTaken);

module.exports = router;