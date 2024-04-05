const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../dbConfig'); 

async function getUserBox(req, res) {
    const { userId } = req.params; 
  
    try {
      let pool = await sql.connect(dbConfig);
      const tankDetails = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM dbo.user_box WHERE user_id = @userId;');
  
      res.json(tankDetails.recordset);
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  router.get('/getUserBox/:userId', getUserBox);

  
  module.exports = router;
  