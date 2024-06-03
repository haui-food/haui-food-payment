require('dotenv').config();

const env = {
  port: +process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  keyHash: process.env.KEY_HASH,
  accountNo: process.env.ACCOUNT_NO,
  minAmount: +process.env.MIN_AMOUNT || 10000,
  usernameHash: process.env.USERNAME_HASH,
  passwordHash: process.env.PASSWORD_HASH,
  transactionHistoryInterVal: process.env.TRANSACTION_HISTORY_INTERVAL,
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.CHAT_ID,
  },
  apiKeyPayment: process.env.API_KEY_PAYMENT || 'payment',
  urlGatewayPayment: process.env.URL_GATEWAY_PAYMENT || 'http://localhost:5000/gateway/payment',
};

module.exports = env;
