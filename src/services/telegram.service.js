const { Telegraf } = require('telegraf');

const env = require('../config');
const bot = new Telegraf(env.telegram.token);

const currentTime = () => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
};

const sendMessage = async (message) => {
  try {
    await bot.telegram.sendMessage(env.telegram.chatId, `${currentTime()} - ${message}`);
  } catch (error) {
    await bot.telegram.sendMessage(env.telegram.chatId, `${currentTime()} - ${error.message}`);
  }
};

module.exports = {
  sendMessage,
};
