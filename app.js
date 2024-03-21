const express = require('express');
const app = express();
const boxRoutes = require('./src/models/getBoxes'); 

app.get('/api/test', (req, res) => {
  res.send('Test route is working!');
});

app.use('/api', boxRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
