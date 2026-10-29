const express = require('express');
const accountRouter = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const accountController = require("../controllers/account.controller");

accountRouter.post("/", authMiddleware.authMiddleware, accountController.createAccount);
accountRouter.get("/", authMiddleware.authMiddleware, accountController.getUserAccounts);
accountRouter.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getUserBalance);

module.exports = accountRouter;