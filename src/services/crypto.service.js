const cryptoJS = require('crypto-js');

const { keyHash } = require('../config');

const encrypt = (data) => {
  const cipherText = cryptoJS.AES.encrypt(data, keyHash).toString();

  return cipherText;
};

const decrypt = (data) => {
  const bytes = cryptoJS.AES.decrypt(data, keyHash);

  const plaintext = bytes.toString(cryptoJS.enc.Utf8);

  return plaintext;
};

module.exports = {
  encrypt,
  decrypt,
};
