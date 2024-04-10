const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function setTankInfo(req, res) {
  const boxId = req.params.boxId;  
  const { servo_id, temperature, humidity } = req.body;  


  try {
    let pool = await sql.connect(dbConfig);

    // Check if a record with the same boxId and tankNumber already exists
    const existingRecord = await pool.request()
      .input('box_id', sql.Int, boxId)
      .input('servo_id', sql.Int, servo_id)
      .query('SELECT * FROM [dbo].[tank] WHERE box_id = @box_id AND servo_id = @servo_id');

    if (existingRecord.recordset.length > 0) {
      // Update the existing record
      await pool.request()
        .input('box_id', sql.Int, boxId)
        .input('servo_id', sql.Int, servo_id)
        .input('temperature', sql.Float, temperature)
        .input('humidity', sql.Float, humidity)
        .query('UPDATE dbo.tank SET temperature = @temperature, humidity = @humidity WHERE box_id = @box_id AND servo_id = @servo_id');
    } else {
      // Insert a new record
      await pool.request()
        .input('box_id', sql.Int, boxId)
        .input('servo_id', sql.Int, servo_id)
        .input('temperature', sql.Float, temperature)
        .input('humidity', sql.Float, humidity)
        .query('INSERT INTO dbo.tank (box_id, servo_id, temperature, humidity) VALUES (@box_id, @servo_id, @temperature, @humidity)');
    }

    res.json({ message: 'Tank information updated successfully' });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

router.post('/setTankInfo/:boxId', setTankInfo);

module.exports = router;
