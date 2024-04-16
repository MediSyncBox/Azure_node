const express = require('express');
const sql = require('mssql');
const dbConfig = require('../dbConfig');
const router = express.Router();
const cron = require('node-cron');

async function checkCron(req, res) {
  const currentTime = new Date().toISOString().slice(0, -1) + '0000000';

  res.status(200).send({ message: 'cron works' });
}

// cron runs every minute
cron.schedule('* *', async () => {
  // Mimic a request and response object if necessary
  let req = {}; // dummy request object
  let res = { json: console.log }; // dummy response object with json method
  await checkCron(req, res);
});

router.get('/check-cron', checkCron);

module.exports = router;