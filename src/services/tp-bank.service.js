const axios = require('axios');

const { User, Payment } = require('../models');
const cacheService = require('./cache.service');
const cryptoService = require('./crypto.service');
const { usernameHash, passwordHash, accountNo } = require('../config');
const {
  KEY_ACCESS_TOKEN,
  KEY_TOTAL_BALANCE,
  KEY_LIST_PAYMENTS,
  ONE_DAY_IN_SECONDS,
  DATE_NUMBER_DIFFERENCE,
  TIME_CACHE_LIST_PAYMENTS,
} = require('../constants');

const username = cryptoService.decrypt(usernameHash);
const password = cryptoService.decrypt(passwordHash);

const makeDeviceId = (t) => {
  let e = '',
    n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    o = n.length;
  for (let i = 0; i < t; i++) e += n.charAt(Math.floor(Math.random() * o));
  return e;
};

const getDeviceId = () => makeDeviceId(45);

const deviceId = getDeviceId();

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const adjustCurrentDate = (days) => {
  const currentDate = new Date();
  const adjustedDate = new Date(currentDate.getTime() + days * ONE_DAY_IN_SECONDS);

  const year = adjustedDate.getFullYear();
  const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
  const day = String(adjustedDate.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

const findDifferentElements = (arr1, arr2) => {
  const differentElements1 = arr1.filter((element) => !arr2.includes(element));

  const differentElements2 = arr2.filter((element) => !arr1.includes(element));

  const differentElements = [...differentElements1, ...differentElements2];

  return differentElements;
};

const getTotalBalanceOld = async () => {
  const totalBalanceCache = +(await cacheService.get(KEY_TOTAL_BALANCE)) || 0;

  if (totalBalanceCache > 0) {
    return totalBalanceCache;
  }

  const payment = await Payment.find({}).limit(1).sort({ createdAt: -1 });

  if (payment.length > 0) {
    return payment[0].runningBalance;
  }

  return 0;
};

const extractDynamicValue = (desc) => {
  const extractionRules = [
    {
      bank: 'Agribank',
      condition: (str) => str.includes(';'),
      extractor: (str) => str.split(';')[2],
    },
    {
      bank: 'MBBank',
      condition: (str) => str.includes('Thanh toan QR'),
      extractor: (str) => str.split(' ')[3],
    },
    {
      bank: 'Vietcombank',
      condition: (str) => str.includes('MBVCB'),
      extractor: (str) => str.split('.')[3],
    },
    {
      bank: 'Techcombank',
      condition: (str) => {
        const parts = str.split(' ');
        return parts[parts.length - 1].includes('FT');
      },
      extractor: (str) => {
        const parts = str.split(' ');
        return parts.slice(0, -1).join(' ');
      },
    },
  ];

  for (const rule of extractionRules) {
    if (rule.condition(desc)) {
      return rule.extractor(desc);
    }
  }

  return desc;
};

const loginTPBank = async () => {
  const data = {
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
      APP_VERSION: '2024.03.08',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
      Authorization: 'Bearer',
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
      DEVICE_ID: deviceId,
      DEVICE_NAME: 'Chrome',
      DNT: '1',
      Origin: 'https://ebank.tpb.vn',
      PLATFORM_NAME: 'WEB',
      PLATFORM_VERSION: '124',
      Referer: 'https://ebank.tpb.vn/retail/vX/',
      SOURCE_APP: 'HYDRO',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
    data: JSON.stringify(data),
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
      APP_VERSION: '2024.03.08',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
      Authorization: `Bearer  ${accessToken}`,
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
      DEVICE_ID: deviceId,
      DEVICE_NAME: 'Chrome',
      DNT: '1',
      Origin: 'https://ebank.tpb.vn',
      PLATFORM_NAME: 'WEB',
      PLATFORM_VERSION: '124',
      Referer: `https://ebank.tpb.vn/retail/vX/main/inquiry/account/transaction?id=${accountNo}`,
      SOURCE_APP: 'HYDRO',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
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
        const paymentsExist = await Payment.find({ transactionId: { $in: listIds } }).select('transactionId');
        paymentsExistIds = paymentsExist.map((payment) => payment.transactionId);
        cacheService.set(KEY_LIST_PAYMENTS, paymentsExistIds, TIME_CACHE_LIST_PAYMENTS);
      }

      const newIdsTransaction = findDifferentElements(listIds, paymentsExistIds);

      const newTransactionRaw = transactionInfos.filter((transactionInfo) =>
        newIdsTransaction.includes(transactionInfo.id),
      );

      console.log('Total balance:', transactionInfos[0].runningBalance);

      if (newTransactionRaw.length) {
        for (const newTransaction of newTransactionRaw) {
          const { amount, description, runningBalance } = newTransaction;

          await Payment.create({
            transactionId: newTransaction.id,
            amount,
            description,
            runningBalance,
          });

          const username = extractDynamicValue(description);
          const user = await User.findOne({ username });
          if (user) {
            user.accountBalance += +amount;
            await user.save();
          }
        }
        console.log('Old transaction: ', paymentsExistIds);

        cacheService.set(KEY_LIST_PAYMENTS, [...paymentsExistIds, ...newIdsTransaction], TIME_CACHE_LIST_PAYMENTS);
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

module.exports = {
  loginTPBank,
  getTotalBalanceOld,
  getTransactionHistory,
};
