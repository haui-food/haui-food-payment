const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    totalMoney: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bank'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['pending', 'canceled', 'confirmed', 'reject', 'shipping', 'success'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Order', orderSchema);
