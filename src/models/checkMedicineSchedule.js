const sql = require('mssql');
const dbConfig = require('./dbConfig');
const http = require('http');

async function checkMedicineSchedule(res) {
  const currentTime = new Date().toISOString().slice(0, -1) + '0000000';

  try {
    let pool = await sql.connect(dbConfig);

    // Query the schedule table to check for matching scheduled times
    const scheduleResult = await pool.request()
      //.input('currentTime', sql.VarChar, currentTime)
      .query('SELECT * FROM dbo.schedule WHERE id = 583');

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

          // Query the tank table to get the tank_id for the medicine and box
          const tankResult = await pool.request()
            .input('medicineName', sql.VarChar, medicineName)
            .input('boxId', sql.Int, boxId)
            .query('SELECT id FROM dbo.tank WHERE pillName = @medicineName AND box_id = @boxId');

          if (tankResult.recordset.length > 0) {
            const tankId = tankResult.recordset[0].id;

            res.json(JSON.stringify({
              boxId: boxId,
              tankId: tankId,
              medicineName: medicineName,
              scheduledTime: scheduledTime
            }));

          } else {
            console.log(`No tank found for medicine: ${medicineName} and Box ID: ${boxId}`);
          }
        } else {
          console.log(`No box found for User ID: ${userId}`);
        }
      }
    } else {
      console.log('No matching medicine schedules found');
    }
  } catch (err) {
    console.error('No matching time entries found');
    res.status(200);
            // Create the HTTPS URL for your main.cpp to listen to
          
  }
}

// Run the checkMedicineSchedule function every minute
//setInterval(checkMedicineSchedule, 60000);