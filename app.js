const express = require('express');
const app = express();
const boxRoutes = require('./src/models/getBoxes'); // 确保这个路径与你的文件结构匹配

app.get('/api/test', (req, res) => {
  res.send('Test route is working!');
});

app.use('/api', boxRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
