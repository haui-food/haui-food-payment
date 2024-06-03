const axios = require('axios');

const env = require('../config');

const sendMessage = async (payload) => {
  const { desc, amount, method } = payload;
  const data = JSON.stringify({
    desc,
    amount,
    method,
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: env.urlGatewayPayment,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.apiKeyPayment,
    },
    data: data,
  };

  try {
    await axios.request(config);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  sendMessage,
};
