const express = require('express');

const env = require('./config');

const app = express();

app.all('*', (req, res) => {
  res.send('Service payment is running 🌱');
});

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
