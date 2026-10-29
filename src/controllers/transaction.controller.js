const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

async function createTransaction(req, res) {
  // Step 1 - Validate request

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, ToAccount, Amount, IdempotencyKey are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
    user: req.user._id,
  });
  const toUserAccount = await accountModel.findOne({ _id: fromAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({ message: "Invalid fromAccount or toAccount" });
  }

  // Step 2 - Validate idempotency key

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      res.status(200).json({
        message: "Transaction already processed",
        trasaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      res.status(200).json({ message: "Transaction is still processing" });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      res
        .status(500)
        .json({ message: "Transaction processing failed, please retry" });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      res
        .status(500)
        .json({ message: "Transaction was reversed, please retry" });
    }
  }

  // Step 3 - Check account status

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount & toAccount must be ACTIVE to process transaction",
    });
  }

  // Step 4 - Derive sender balance from ledger

  const balance = await fromUserAccount.getBalance();
  console.log(balance);
  

  if (balance < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  // Step 5 - Create Transaction

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromAccount,
        amount,
        type: "DEBIT",
        transaction: transaction._id,
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount,
        type: "CREDIT",
        transaction: transaction._id,
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction()
  session.endSession();

  // Step 10 - Send email notification

  emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  res
    .status(201)
    .json({ message: "Transaction complete successfully", transaction });
}

async function createInitialFundTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "ToAccount, Amount, IdempotencyKey are required",
    });
  }

  const toUserAccount = await accountModel.findOne({ _id: toAccount });
  if (!toUserAccount) {
    return res.status(400).json({ message: "Invalid toAccount" });
  }

  const systemAccount = await accountModel.findOne({ user: req.user._id });

  if (!systemAccount) {
    return res.status(500).json({ message: "System account not exists" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: systemAccount._id,
    toAccount: toUserAccount,
    amount,
    status: "PENDING",
    idempotencyKey,
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: systemAccount._id,
        type: "DEBIT",
        amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toUserAccount,
        type: "CREDIT",
        amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction,
  });
}

module.exports = { createTransaction, createInitialFundTransaction };
