const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const transactionController = require('../controllers/transaction.controller')

const transactionRouter = express.Router()

transactionRouter.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)

transactionRouter.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundTransaction);

module.exports = transactionRouter