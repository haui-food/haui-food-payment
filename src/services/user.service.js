const { User } = require('../models');

const getByUsername = async (username) => {
  return await User.findOne({ username });
};

const updateBalanceByUsername = async (username, amount) => {
  const user = await getByUsername(username);

  if (user) {
    user.accountBalance += amount;
    await user.save();
  }
};

module.exports = {
  getByUsername,
  updateBalanceByUsername,
};
