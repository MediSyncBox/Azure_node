const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();
const cron = require('node-cron');

async function checkMedicineSchedule(req, res) {
   const currentTime = new Date().toISOString().slice(0, -1) + '0000000';

   try {
     let pool = await sql.connect(dbConfig);

    // Query the schedule table to check for matching scheduled times
    const scheduleResult = await pool.request()
      .query('SELECT * FROM dbo.schedule WHERE id = 600');

    if (scheduleResult.recordset.length > 0) {
      // Matching schedules found
      for (const schedule of scheduleResult.recordset) {
        const userId = schedule.user_id;
        const medicineName = schedule.medicine;
        const scheduledTime = schedule.time;

        // Query the user_box table to get the box_id for the user
        const userBoxResult = await pool.request()
          .input('userId', sql.Int, userId)
          .query('SELECT box_id FROM dbo.user_box WHERE user_id = @userId');

        if (userBoxResult.recordset.length > 0) {
          const boxId = userBoxResult.recordset[0].box_id;

          // Dummy tank ID for demonstration
          const tankId = 2;
          //res.json({
          //  boxId: boxId,
          //  tankId: tankId,
          //  medicineName: medicineName,
          //  scheduledTime: scheduledTime
          //});
          // Redirect or construct a URL with boxId
          const redirectUrl = url.format({
            pathname: `/boxes/${boxId}/reminder`,
            query: {
              tankId: tankId,
              medicineName: medicineName,
              scheduledTime: scheduledTime
            }
          });
          // Redirect to the URL
          res.redirect(redirectUrl);

        } else {
          console.log(`No box found for User ID: ${userId}`);
          res.status(404).send(`No box found for User ID: ${userId}`);
        }
      }
    } else {
      console.log('No matching medicine schedules found');
      res.status(404).send('No matching medicine schedules found');
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Database error');
  }
}

//cron runs every minute
cron.schedule('* * * * *', async () => {
  // Mimic a request and response object if necessary
  let req = {}; // dummy request object
  let res = { redirect: console.log }; // dummy response object with redirect method

  await checkMedicineSchedule(req, res);
});

// Example route to display details based on boxId
router.get('/boxes/:boxId/reminder', (req, res) => {
  const { boxId } = req.params;
  const { tankId, medicineName, scheduledTime } = req.query;

  console.log(req.query, tankId, medicineName, scheduledTime);
  //res.json({
  //  boxId: boxId,
  //  tankId: tankId,
  //  medicineName: medicineName,
  //  scheduledTime: scheduledTime
  //});
  //res.send(`Reminder for boxId ${boxId}`);
});

router.get('/medicine-reminder', checkMedicineSchedule);

module.exports = router;
