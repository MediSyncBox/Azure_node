const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../dbConfig'); 

// Database operation for getting boxes
async function getBoxes() {
    try {
        let poolConnection = await sql.connect(dbConfig);
        console.log("Reading rows from the Boxes table...");
        let resultSet = await poolConnection.request().query('SELECT * FROM [dbo].[box];');

        console.log(`${resultSet.recordset.length} rows returned.`);
        let columns = Object.keys(resultSet.recordset.columns).join(", ");
        console.log("Columns:\t", columns);

        resultSet.recordset.forEach(row => {
            console.log("%d\t%s\t%s", row.patient_id, row.patient_id, row.patient_id);
        });
        poolConnection.close();
        return resultSet.recordset;
    } catch (err) {
        console.error('Failed to query the Boxes table:', err.message);
    }
}

async function getBoxesHandler(req, res) {
    try {
        const boxes = await getBoxes();
        console.log("Boxes data received:");
        console.table(boxes);
        res.json(boxes);
    } catch (err) {
        console.error('Failed to load boxes:', err.message);
        res.status(500).send(err.message);
    }
}

// Routing setup
router.get('/boxes', getBoxesHandler);

module.exports = router;
