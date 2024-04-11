const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig'); // 确保路径正确

const router = express.Router();

// 删除给定用户ID和药品名称的schedule项
router.delete('/batchDelete/:userId/:medicine', async (req, res) => {
    const { userId, medicine } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    try {
        let pool = await sql.connect(dbConfig);

        let result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('medicine', sql.NVarChar, medicine)
            .input('today', sql.Date, today)
            .query('DELETE FROM dbo.schedule WHERE user_id = @userId AND medicine = @medicine AND time >= @today;');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Medicine deleted successfully' });
        } else {
            res.status(404).send({ message: 'No medicine found with the given criteria' });
        }
    } catch (err) {
        console.error('SQL error:', err.message);
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;
