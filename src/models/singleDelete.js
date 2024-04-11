const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig'); // 确保路径正确
const router = express.Router();

router.delete('/singleDelete/:scheduleId', async (req, res) => {
    const { scheduleId } = req.params;

    try {
        let pool = await sql.connect(dbConfig);

        let result = await pool.request()
            .input('scheduleId', sql.Int, scheduleId)
            .query('DELETE FROM dbo.schedule WHERE id = @scheduleId;');

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Schedule deleted successfully' });
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (err) {
        console.error('SQL error:', err.message);
        res.status(500).json({ message: 'Error deleting schedule' });
    }
});

module.exports = router;
