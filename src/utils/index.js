const { ONE_DAY_IN_SECONDS } = require('../constants');

const makeDeviceId = (t) => {
  let e = '',
    n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    o = n.length;
  for (let i = 0; i < t; i++) e += n.charAt(Math.floor(Math.random() * o));
  return e;
};

const getDeviceId = () => makeDeviceId(45);

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
      extractor: (str) => str.split(' ').slice(3).join(' '),
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
      extractor: (str) => str.split(' ').slice(0, -1).join(' '),
    },
  ];

  for (const rule of extractionRules) {
    if (rule.condition(desc)) {
      return rule.extractor(desc);
    }
  }

  return desc;
};

module.exports = {
  getDeviceId,
  getRandomNumber,
  adjustCurrentDate,
  extractDynamicValue,
  findDifferentElements,
};
