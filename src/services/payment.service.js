const { Payment } = require('../models');

const getTotalBalanceOld = async () => {
  const payment = await Payment.find({}).limit(1).sort({ createdAt: -1 });

  if (payment.length > 0) {
    return payment[0].runningBalance;
  }

  return 0;
};

const getListTransactionIds = async () => {
  const transactionIds = await Payment.distinct('transactionId');

  return transactionIds;
};

const createNew = async (createBody) => {
  await Payment.create(createBody);
};

module.exports = {
  createNew,
  getTotalBalanceOld,
  getListTransactionIds,
};
