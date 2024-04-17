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

      // Query the schedule table for all untaken schedules for the userId
      const scheduleResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM dbo.schedule WHERE user_id = @userId AND taken = 0');

      if (scheduleResult.recordset.length > 0) {
        const currentDateTime = new Date(currentTime);

        // Find the schedule with the minimum time difference within the allowed range
        let matchedSchedule = null;
        let minTimeDifference = Infinity;

        for (const schedule of scheduleResult.recordset) {
          const scheduledDateTime = new Date(schedule.time);
          const timeDifference = Math.abs(currentDateTime - scheduledDateTime);

          if (timeDifference <= 5000 && timeDifference < minTimeDifference) {
            matchedSchedule = schedule;
            minTimeDifference = timeDifference;
          }
        }

        if (matchedSchedule) {
          const scheduledTime = matchedSchedule.time;
          const pillName = matchedSchedule.medicine;
          const dose = matchedSchedule.dose;
          const tankId = -1;

          // Get the correct tank ID 
          // Query the tank table to get the tank_id for the medicine and box
          const tankResult = await pool.request()
            .input('pillName', sql.NVarChar, pillName)
            .input('boxId', sql.Int, boxId)
            .query('SELECT * FROM dbo.tank WHERE pillName = @pillName AND box_id = @boxId');

          if (tankResult.recordset.length > 0) {
            tankId = tankResult.recordset[0].id;
          }

          // Send the information as a JSON string
          res.json({
            boxId: boxId,
            tankId: tankId,
            medicineName: medicineName,
            scheduledTime: scheduledTime,
            dose: dose
          });
        } else {
          console.log('No matching medicine schedules found within the allowed time difference');
          res.json({ boxId: boxId, tankId: -1, dose : -1 });
        }
      } else {
        console.log(`No untaken medicine schedules found for User ID: ${userId}`);
        res.json({ boxId: boxId, tankId: -2 , dose : -2});
      }
    } else {
      console.log(`No user found for Box ID: ${boxId}`);
      res.json({ boxId: boxId, tankId: -3, dose : -3 });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.json({ boxId: boxId, tankId: -4, dose : -4 });
  }
}

router.post('/medicine-reminder/:boxId', checkMedicineSchedule);

module.exports = router;