const express = require('express');
const app = express();
const boxRoutes = require('./src/models/getBoxes'); 
const userRoutes = require('./src/models/loginRegister'); 
const addBoxRoutes = require('./src/models/addBox'); 
const addPillsRoutes = require('./src/models/addPills'); 
const getUserBoxRoutes = require('./src/models/getUserBox'); 
const getTankInfoRoutes = require('./src/models/getTankInfo'); 
const addScheduleRoutes = require('./src/models/addEditSchedule'); 
const getSchedulesRoutes = require('./src/models/getSchedules');
const updateSchedulesRoutes = require('./src/models/updateSchedules');
const updateTakenStatusRoutes = require('./src/models/updateTakenStatus');
const getPatientRoutes = require('./src/models/getPatient');
const addPatientRoutes = require('./src/models/addPatient');
const getMedicinesRoutes = require('./src/models/getMedicines');
const setTankInfo = require('./src/models/setTankInfo');
const checkMedicineSchedule = require('./src/models/checkMedicineSchedule');
const batchDeleteRouter = require('./src/models/batchDelete');
const singleDeleteRouter = require('./src/models/singleDelete');
//const checkCron = require('./src/models/checkCron');


app.use(express.json());
app.get('/api/test', (req, res) => {
  res.send('Test route is working!');
});

app.use('/api', boxRoutes);
app.use('/api', userRoutes);
app.use('/api', addBoxRoutes);
app.use('/api', getTankInfoRoutes);
app.use('/api', addScheduleRoutes);
app.use('/api', addPillsRoutes);
app.use('/api', getSchedulesRoutes);
app.use('/api', getUserBoxRoutes);
app.use('/api', updateSchedulesRoutes);
app.use('/api', updateTakenStatusRoutes);
app.use('/api', getPatientRoutes);
app.use('/api', addPatientRoutes);
app.use('/api', getMedicinesRoutes);
app.use('/api', checkMedicineSchedule);
app.use('/api', setTankInfo);
app.use('/api', batchDeleteRouter);
app.use('/api', singleDeleteRouter);
//app.use('/api', checkCron);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
