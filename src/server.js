const cron = require('node-cron');
const express = require('express');
const mongoose = require('mongoose');

const env = require('./config');
const { TBBankService } = require('./services');

const app = express();

const time = env.transactionHistoryInterVal;

const scheduledTasks = [{ task: TBBankService.getTransactionHistory, schedule: `*/${time} * * * * *` }];

mongoose.set('debug', true);

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
