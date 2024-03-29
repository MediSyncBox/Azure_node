const express = require('express');
const app = express();
const boxRoutes = require('./src/models/getBoxes'); 
const userRoutes = require('./src/models/loginRegister'); 
const addBoxRoutes = require('./src/models/addBox'); 
const addScheduleRoutes = require('./src/models/addEditSchedule'); 
const getSchedulesRoutes = require('./src/models/getSchedules');

app.use(express.json());
app.get('/api/test', (req, res) => {
  res.send('Test route is working!');
});

app.use('/api', boxRoutes);
app.use('/api', userRoutes);
app.use('/api', addBoxRoutes);
app.use('/api', addScheduleRoutes);
app.use('/api', getSchedulesRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
