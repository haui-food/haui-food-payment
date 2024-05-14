require('dotenv').config();

const env = {
  port: +process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGO_URI,
  keyHash: process.env.KEY_HASH,
  accountNo: process.env.ACCOUNT_NO,
  usernameHash: process.env.USERNAME_HASH,
  passwordHash: process.env.PASSWORD_HASH,
  transactionHistoryInterVal: process.env.TRANSACTION_HISTORY_INTERVAL,
};

module.exports = env;
