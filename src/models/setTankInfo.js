const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function setTankInfo(req, res) {
  const { boxId, tankNumber, temperature, humidity, lightValue } = req.body;

  try {
    let pool = await sql.connect(dbConfig);

    // Check if a record with the same boxId and tankNumber already exists
    const existingRecord = await pool.request()
      .input('boxId', sql.Int, boxId)
      .input('tankNumber', sql.Int, tankNumber)
      .query('SELECT * FROM dbo.tank WHERE box_id = @boxId AND tank_number = @tankNumber');

    if (existingRecord.recordset.length > 0) {
      // Update the existing record
      await pool.request()
        .input('boxId', sql.Int, boxId)
        .input('tankNumber', sql.Int, tankNumber)
        .input('temperature', sql.Float, temperature)
        .input('humidity', sql.Float, humidity)
        .input('lightValue', sql.Int, lightValue)
        .query('UPDATE dbo.tank SET temperature = @temperature, humidity = @humidity, light_value = @lightValue WHERE box_id = @boxId AND tank_number = @tankNumber');
    } else {
      // Insert a new record
      await pool.request()
        .input('boxId', sql.Int, boxId)
        .input('tankNumber', sql.Int, tankNumber)
        .input('temperature', sql.Float, temperature)
        .input('humidity', sql.Float, humidity)
        .input('lightValue', sql.Int, lightValue)
        .query('INSERT INTO dbo.tank (box_id, tank_number, temperature, humidity, light_value) VALUES (@boxId, @tankNumber, @temperature, @humidity, @lightValue)');
    }

    res.json({ message: 'Tank information updated successfully' });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

router.post('/setTankInfo/:boxId', setTankInfo);

module.exports = router;
