const { Payment } = require('../models');

const getTotalBalanceOld = async () => {
  const payment = await Payment.find({}).limit(1).sort({ createdAt: -1 });

  if (payment.length > 0) {
    return payment[0].runningBalance;
  }

  return 0;
};

const getListTransactionIds = async () => {
  const payments = await Payment.find({
    createdAt: { $gte: new Date(Date.now() - 36 * 60 * 60 * 1000) },
  }).sort({ createdAt: -1 });

  const paymentsIds = payments.map((payment) => payment.transactionId);

  const paymentIdsUnique = [...new Set(paymentsIds)];

  return paymentIdsUnique;
};

const createNew = async (createBody) => {
  await Payment.create(createBody);
};

module.exports = {
  createNew,
  getTotalBalanceOld,
  getListTransactionIds,
};
