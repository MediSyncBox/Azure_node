const express = require('express');
const app = express();
const boxRoutes = require('./src/models/getBoxes'); 
const userRoutes = require('./src/models/loginRegister'); 

app.get('/api/test', (req, res) => {
  res.send('Test route is working!');
});

app.use('/api', boxRoutes);
app.use('/api', userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
