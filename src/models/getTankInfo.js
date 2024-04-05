const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../dbConfig'); 

async function getTankInfo(req, res) {
    const { boxId } = req.params; 
  
    try {
      let pool = await sql.connect(dbConfig);
      const tankDetails = await pool.request()
        .input('boxId', sql.Int, boxId)
        .query('SELECT * FROM dbo.tank WHERE box_id = @boxId;');
  
      res.json(tankDetails.recordset);
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  router.get('/getTankInfo/:boxId', getTankInfo);
  
  module.exports = router;
  