const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
  description: {
    type: String,
  },
  amount: {
    type: Number,
  },
  runningBalance: {
    type: Number,
  },
  dateTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
