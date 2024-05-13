require('dotenv').config();

const env = {
  port: +process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI,
  keyHash: process.env.KEY_HASH,
  accountNo: process.env.ACCOUNT_NO,
  usernameHash: process.env.USERNAME_HASH,
  passwordHash: process.env.PASSWORD_HASH,
};

module.exports = env;
