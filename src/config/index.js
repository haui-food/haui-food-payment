require('dotenv').config();

const env = {
  port: +process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI,
  keyHash: process.env.KEY_HASH,
  username: process.env.USERNAME_BANK,
  password: process.env.PASSWORD_BANK,
};

module.exports = env;
