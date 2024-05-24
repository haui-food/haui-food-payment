const axios = require('axios');

const env = require('../config');
const apiService = require('./api.service');
const userService = require('./user.service');
const cacheService = require('./cache.service');
const cryptoService = require('./crypto.service');
const paymentService = require('./payment.service');
const { usernameHash, passwordHash, accountNo } = require('../config');
const {
  KEY_ACCESS_TOKEN,
  KEY_LIST_PAYMENTS,
  DATE_NUMBER_DIFFERENCE,
  TIME_CACHE_LIST_PAYMENTS,
} = require('../constants');
const {
  getDeviceId,
  getRandomNumber,
  adjustCurrentDate,
  extractDynamicValue,
  findDifferentElements,
} = require('../utils');

const username = cryptoService.decrypt(usernameHash);
const password = cryptoService.decrypt(passwordHash);

const deviceId = getDeviceId();

const baseHeaders = {
  APP_VERSION: '2024.03.08',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
  Connection: 'keep-alive',
  'Content-Type': 'application/json',
  DEVICE_ID: deviceId,
  DEVICE_NAME: 'Chrome',
  DNT: '1',
  Origin: 'https://ebank.tpb.vn',
  PLATFORM_NAME: 'WEB',
  PLATFORM_VERSION: '124',
  SOURCE_APP: 'HYDRO',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

const loginTPBank = async () => {
  const requestData = {
    username,
    password,
    deviceId,
    step_2FA: 'VERIFY',
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://ebank.tpb.vn/gateway/api/auth/login',
    headers: {
      ...baseHeaders,
      Authorization: 'Bearer',
      Referer: 'https://ebank.tpb.vn/retail/vX/',
    },
    data: JSON.stringify(requestData),
  };

  try {
    console.log('Login');
    const response = await axios(config);
    const { status, data } = response;

    if (status === 200) {
      const accessToken = data.access_token;

      const ttlCacheTokenRandom = getRandomNumber(50, 75);

      cacheService.set(KEY_ACCESS_TOKEN, accessToken, ttlCacheTokenRandom);

      return accessToken;
    }

    return null;
  } catch (error) {
    console.log(error.response.data);
    return null;
  }
};

const getTransactionHistory = async () => {
  const toDate = adjustCurrentDate(DATE_NUMBER_DIFFERENCE);
  const fromDate = adjustCurrentDate(-DATE_NUMBER_DIFFERENCE);

  let accessToken = await cacheService.get(KEY_ACCESS_TOKEN);
  if (!accessToken) {
    accessToken = await loginTPBank();
  }

  const requestData = {
    pageNumber: 1,
    pageSize: 400,
    accountNo,
    currency: 'VND',
    maxAcentrysrno: '',
    toDate,
    fromDate,
    keyword: '',
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://ebank.tpb.vn/gateway/api/smart-search-presentation-service/v2/account-transactions/find',
    headers: {
      ...baseHeaders,
      Authorization: `Bearer  ${accessToken}`,
      Referer: `https://ebank.tpb.vn/retail/vX/main/inquiry/account/transaction?id=${accountNo}`,
    },
    data: JSON.stringify(requestData),
  };

  try {
    console.log('Get money');
    const response = await axios(config);
    const { status, data: responseData } = response;

    if (status === 200) {
      const { transactionInfos } = responseData;

      const listIds = transactionInfos.map((transactionInfo) => transactionInfo.id);

      let paymentsExistIds = cacheService.get(KEY_LIST_PAYMENTS) || [];

      if (!paymentsExistIds.length) {
        console.log('Get payments exist database');
        paymentsExistIds = await paymentService.getListTransactionIds();
        cacheService.set(KEY_LIST_PAYMENTS, paymentsExistIds, TIME_CACHE_LIST_PAYMENTS);
      }

      const newIdsTransaction = findDifferentElements(listIds, paymentsExistIds);

      const newTransactionRaw = transactionInfos.filter((transactionInfo) =>
        newIdsTransaction.includes(transactionInfo.id),
      );

      console.log('Total balance:', transactionInfos[0].runningBalance);

      if (newTransactionRaw.length) {
        for (const newTransaction of newTransactionRaw) {
          const { id: transactionId, amount, description, runningBalance } = newTransaction;

          const newPayment = {
            amount,
            description,
            transactionId,
            runningBalance,
          };

          await paymentService.createNew(newPayment);

          let dataSend = { desc, status: 'SUCCESS', amount, balance: runningBalance };
          const desc = extractDynamicValue(description);

          const isRecharge = checkPaymentType(description);

          if (isRecharge) {
            if (amount >= env.minAmount) {
              userService.updateBalanceByUsername(desc, +amount);
            }
          }

          dataSend = { ...dataSend, method: isRecharge ? 'recharge' : 'payment' };

          await apiService.sendMessage(dataSend);
        }
        console.log('Old transaction: ', paymentsExistIds);

        cacheService.set(
          KEY_LIST_PAYMENTS,
          new Set([...paymentsExistIds, ...newIdsTransaction]),
          TIME_CACHE_LIST_PAYMENTS,
        );
        const newTransaction = cacheService.get(KEY_LIST_PAYMENTS) || [];

        console.log('New transaction: ', newTransaction);
      }

      return newTransactionRaw;
    }

    return null;
  } catch (error) {
    console.log(error.response.data);
    return null;
  }
};

const checkPaymentType = (description) => {
  const isRecharge = description.includes('hauifood');
  return isRecharge;
};

module.exports = {
  loginTPBank,
  getTransactionHistory,
};
