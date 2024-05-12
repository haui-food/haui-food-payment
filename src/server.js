const express = require('express');
const mongoose = require('mongoose');

const env = require('./config');

const app = express();

app.all('*', (req, res) => {
  res.send('Service payment is running 🌱');
});

mongoose
  .connect(env.mongoURI)
  .then(() => {
    console.log('Connected to database');
  })
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  });
