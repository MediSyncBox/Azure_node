import { app, timer } from "@azure/functions";
const sql = require('mssql');
const dbConfig = require('./dbConfig');
const http = require('http');

async function checkMedicineSchedule(context) {
  const currentTime = new Date().toLocaleTimeString();

  try {
    let pool = await sql.connect(dbConfig);

    // Query the schedule table to check for matching scheduled times
    const scheduleResult = await pool.request()
      .input('currentTime', sql.VarChar, currentTime)
      .query('SELECT * FROM dbo.schedule WHERE time = @currentTime AND taken = 0');

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

            // Create the HTTPS URL for your main.cpp to listen to
            const options = {
              hostname: 'https://medisyncconnection.azurewebsites.net/api/',
              path: `/medicine-reminder/${boxId}`,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            };

            // Send the message to the HTTPS URL
            const req = http.request(options, (res) => {
              context.log(`Medicine reminder sent for Box ID: ${boxId}, Tank ID: ${tankId}`);
            });

            req.on('error', (error) => {
              context.log(`Error sending medicine reminder for Box ID: ${boxId}, Tank ID: ${tankId}`, error);
            });

            req.write(JSON.stringify({
              boxId: boxId,
              tankId: tankId,
              medicineName: medicineName,
              scheduledTime: scheduledTime
            }));

            req.end();
          } else {
            context.log(`No tank found for medicine: ${medicineName} and Box ID: ${boxId}`);
          }
        } else {
          context.log(`No box found for User ID: ${userId}`);
        }
      }
    } else {
      context.log('No matching medicine schedules found');
    }
  } catch (err) {
    context.log('SQL error:', err);
  }
}

app.timer('checkMedicineSchedule', {
  schedule: '0 */1 * * * *',
  handler: checkMedicineSchedule
});

module.exports = checkMedicineSchedule;