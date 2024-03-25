const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig'); 
const router = express.Router();


async function addBox(req, res) {
    const { userId, boxId, name } = req.body;
    
    try {
      let pool = await sql.connect(dbConfig);
      
      // 检查Box是否存在
      const box = await pool.request()
        .input('boxId', sql.Int, boxId)
        .query('SELECT * FROM dbo.box WHERE id = @boxId;');
      
      if (box.recordset.length === 0) {
        return res.status(404).send('Box not found.');
      }
      
      // 更新Box信息
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('name', sql.NVarChar, name)
        .input('boxId', sql.Int, boxId)
        .query('UPDATE dbo.box SET user_id = @userId, name = @name WHERE id = @boxId;');
      
      res.status(200).json({ message: 'Box updated successfully.' });
    } catch (err) {
      console.error('Failed to update box:', err.message);
      res.status(500).send(err.message);
    }
  }
  

router.post('/addBox', addBox);

module.exports = router;