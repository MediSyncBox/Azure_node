const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

async function checkMedicineSchedule(req, res) {
  const { boxId } = req.params;
  const { currentTime } = req.body;

  try {
    let pool = await sql.connect(dbConfig);

    // Query the user_box table to get the user_id for the given boxId
    const userBoxResult = await pool.request()
      .input('boxId', sql.Int, boxId)
      .query('SELECT user_id FROM dbo.user_box WHERE box_id = @boxId');

    if (userBoxResult.recordset.length > 0) {
      const userId = userBoxResult.recordset[0].user_id;

      // Query the schedule table for the earliest scheduled time with taken = 0 for the userId
      const scheduleResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT TOP 1 * FROM dbo.schedule WHERE user_id = @userId AND taken = 0 ORDER BY time ASC');

      if (scheduleResult.recordset.length > 0) {
        const earliestSchedule = scheduleResult.recordset[0];
        const scheduledTime = earliestSchedule.time;
        const medicineName = earliestSchedule.medicine;

        // Check if the scheduled time is within the allowed time difference (1 minute)
        const currentDateTime = new Date(currentTime);
        const scheduledDateTime = new Date(scheduledTime);
        const timeDifference = Math.abs(currentDateTime - scheduledDateTime);

        if (timeDifference <= 60000) {
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
          console.log('No matching medicine schedules found within the allowed time difference');
          res.json({ boxId: boxId, tankId: -3 });
        }
      } else {
        console.log(`No untaken medicine schedules found for User ID: ${userId}`);
        res.json({ boxId: boxId, tankId: -3 });
      }
    } else {
      console.log(`No user found for Box ID: ${boxId}`);
      res.json({ boxId: boxId, tankId: -3 });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.json({ boxId: boxId, tankId: -3 });
    //res.status(500).json({ error: 'Database error' });
  }
}

router.post('/medicine-reminder/:boxId', checkMedicineSchedule);

module.exports = router;