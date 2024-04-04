const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();

// // Function to add or update a schedule
// async function addEditSchedule(req, res) {
//     // Destructure the body to get the schedule details
//     let { userId, medicine, dose, time, taken } = req.body;

//     try {
//         // Connect to the database
//         let pool = await sql.connect(dbConfig);

//         // Perform the INSERT operation
//         let result = await pool.request()
//             .input('userId', sql.Int, userId)
//             .input('medicine', sql.NVarChar, medicine)
//             // Only include dose and time in the query if they are provided
//             .input('dose', sql.Int, dose)
//             .input('time', sql.SmallDateTime, time)
//             // Convert taken to a boolean if it's provided; otherwise, insert null
//             .input('taken', sql.Bit, taken)
//             .query('INSERT INTO [dbo].[schedule] (user_id, medicine, dose, time, taken) VALUES (@userId, @medicine, @dose, @time, @taken);');

//         // Respond with success if the INSERT operation is successful
//         res.status(201).send('Schedule added successfully.');
//     } catch (err) {
//         // Log and respond with the error message if there's an error
//         console.error('Failed to add schedule:', err.message);
//         res.status(500).send(err.message);
//     }
// }

async function addEditSchedule(req, res) {
    let { userId, medicine, dose, time, taken } = req.body;

    try {
        let pool = await sql.connect(dbConfig);

        // Perform the INSERT operation and capture the new ID
        let result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('medicine', sql.NVarChar, medicine)
            .input('dose', sql.Int, dose)
            .input('time', sql.SmallDateTime, time)
            .input('taken', sql.Bit, taken)
            .query(`
                INSERT INTO [dbo].[schedule] (user_id, medicine, dose, time, taken) 
                OUTPUT INSERTED.id 
                VALUES (@userId, @medicine, @dose, @time, @taken);
            `);

        // Assuming the INSERT operation is successful and an ID is returned
        if (result.recordset.length > 0) {
            const newId = result.recordset[0].id;
            res.status(201).json({ message: 'Schedule added successfully.', id: newId });
        } else {
            throw new Error('Failed to retrieve new schedule ID.');
        }
    } catch (err) {
        console.error('Failed to add schedule:', err.message);
        res.status(500).send(err.message);
    }
}
router.post('/addEditSchedule', addEditSchedule);
module.exports = router;