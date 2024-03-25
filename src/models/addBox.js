const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig'); 
const router = express.Router();


async function addBox(req, res) {
    const { userId, boxId, name } = req.body;
    
    try {
      let pool = await sql.connect(dbConfig);
      
      // 检查Box是否存在
      const boxExists = await pool.request()
        .input('boxId', sql.Int, boxId)
        .query('SELECT * FROM dbo.box WHERE id = @boxId;');
      
      if (boxExists.recordset.length === 0) {
        return res.status(404).json({ message: 'Box not found.' });
      }
      
      // 更新Box信息
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('name', sql.NVarChar, name)
        .input('boxId', sql.Int, boxId)
        .query('UPDATE dbo.box SET user_id = @userId, name = @name WHERE id = @boxId;');
      
      // 重新查询这个Box来获取更新后的全部信息
      const updatedBox = await pool.request()
        .input('boxId', sql.Int, boxId)
        .query('SELECT * FROM dbo.box WHERE id = @boxId;');
      
      // 将更新后的信息发送给前端
      res.json(updatedBox.recordset[0]); // 发送第一条记录作为JSON响应
    } catch (err) {
      console.error('Failed to update box:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
  
  

router.post('/addBox', addBox);

module.exports = router;