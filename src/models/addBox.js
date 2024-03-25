const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig'); 
const router = express.Router();


async function addBox(req, res) {
    const { userId, boxId, name } = req.body;
    
    try {
      let pool = await sql.connect(dbConfig);
      
      
      const boxExists = await pool.request()
        .input('boxId', sql.Int, boxId)
        .query('SELECT * FROM dbo.box WHERE id = @boxId;');
      
      if (boxExists.recordset.length === 0) {
        return res.status(404).json({ message: 'Box not found.' });
      }
      
      
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('name', sql.NVarChar, name)
        .input('boxId', sql.Int, boxId)
        .query('UPDATE dbo.box SET user_id = @userId, name = @name WHERE id = @boxId;');
      
      
      const updatedBox = await pool.request()
        .input('boxId', sql.Int, boxId)
        .query('SELECT * FROM dbo.box WHERE id = @boxId;');
      
      
      res.json(updatedBox.recordset[0]); 
    } catch (err) {
      console.error('Failed to update box:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
  
  

router.post('/addBox', addBox);

module.exports = router;