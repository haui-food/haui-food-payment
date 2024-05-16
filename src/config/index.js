require('dotenv').config();

const env = {
  port: +process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  keyHash: process.env.KEY_HASH,
  mongoURI: process.env.MONGO_URI,
  accountNo: process.env.ACCOUNT_NO,
  minAmount: +process.env.MIN_AMOUNT || 10000,
  usernameHash: process.env.USERNAME_HASH,
  passwordHash: process.env.PASSWORD_HASH,
  transactionHistoryInterVal: process.env.TRANSACTION_HISTORY_INTERVAL,
};

module.exports = env;
