const cron = require('node-cron');
const express = require('express');
const mongoose = require('mongoose');

const env = require('./config');
const { loginTPBank, getTransactionHistory } = require('./services/tp-bank.service');

const app = express();

const time = env.transactionHistoryInterVal;

const scheduledTasks = [{ task: getTransactionHistory, schedule: `*/${time} * * * * *` }];

mongoose.set('debug', true);

app.get('/login', async (req, res) => {
  try {
    const accessToken = await loginTPBank();
    res.send({ accessToken });
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.get('/histories', async (req, res) => {
  try {
    const histories = await getTransactionHistory(req.query.accessToken);
    res.send({ histories });
  } catch (error) {
    res.send({ error: error.message });
  }
});

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
  })
  .then(() => {
    scheduledTasks.forEach(({ task, schedule }) => {
      cron.schedule(schedule, task, { scheduled: true, timezone: 'Asia/Ho_Chi_Minh' });
    });
  });
