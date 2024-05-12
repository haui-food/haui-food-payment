const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    description: {
      type: String,
    },
    amount: {
      type: Number,
    },
    runningBalance: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Payment', paymentSchema);
