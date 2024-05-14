const { User } = require('../models');

const getByUsername = async (username) => {
  return await User.findOne({ username });
};

const updateBalanceByUsername = async (username, balance) => {
  const user = await getByUsername(username);

  if (user) {
    user.accountBalance = balance;
    await user.save();
  }
};

module.exports = {
  getByUsername,
  updateBalanceByUsername,
};
