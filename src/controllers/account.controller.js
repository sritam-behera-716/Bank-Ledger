const accountModel = require("../models/account.model");

async function createAccount(req, res) {
  const user = req.user;
  const account = await accountModel.create({ user: user._id });
  res.status(201).json({ message: "Account created successfully", account });
}

async function getUserAccounts(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  res.status(200).json({ message: "Account fetched successfully", accounts });
}

async function getUserBalance(req, res) {
    const {accountId} = req.params

    const account = await accountModel.findOne({_id: accountId, user: req.user.id})
    if (!account) {
        return res.status(404).json({message: "Account not found"})
    }

    const balance = await account.getBalance()
    res.status(200).json({message: "Balance fetched successfully", balance})
}

module.exports = { createAccount, getUserAccounts, getUserBalance };
