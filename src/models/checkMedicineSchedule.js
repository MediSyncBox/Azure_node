const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

async function checkMedicineSchedule(req, res) {
  const { boxId } = req.params.boxId;
  const { currentTime } = req.body;

  try {
    let pool = await sql.connect(dbConfig);

    // Query the schedule table to check for matching scheduled times
    const scheduleResult = await pool.request()
      .input('currentTime', sql.VarChar, currentTime)
      .query('SELECT * FROM dbo.schedule WHERE time = @currentTime');

    if (scheduleResult.recordset.length > 0) {
      // Matching schedule found
      const schedule = scheduleResult.recordset[0];
      const userId = schedule.user_id;
      const medicineName = schedule.medicine;
      const scheduledTime = schedule.time;

      // Query the user_box table to get the box_id for the user
      const userBoxResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT box_id FROM dbo.user_box WHERE user_id = @userId');

      if (userBoxResult.recordset.length > 0) {
        const userBoxId = userBoxResult.recordset[0].box_id;

        if (userBoxId === parseInt(boxId)) {
          // Dummy tank ID for demonstration
          const tankId = 2;

          // Send the information as a JSON string
          res.json({
            boxId: boxId,
            tankId: tankId,
            medicineName: medicineName,
            scheduledTime: scheduledTime
          });
        } else {
          console.log(`Box ID mismatch: Requested Box ID: ${boxId}, User Box ID: ${userBoxId}`);
          res.json({boxId: boxId,
            tankId: -1}); // Send an empty JSON object
        }
      } else {
        console.log(`No box found for User ID: ${userId}`);
        res.json({boxId: boxId,
          tankId: -1}); // Send an empty JSON object
      }
    } else {
      console.log('No matching medicine schedules found');
      res.json({boxId: boxId,
        tankId: -1}); // Send an empty JSON object
    }
  } catch (err) {
    //console.error('Database error:', err);
    //res.status(500).json({ error: 'Database error' });
    res.json({boxId: boxId,
      tankId: -1});
  }
}

router.post('/medicine-reminder/:boxId', checkMedicineSchedule);

module.exports = router;