const express = require('express');
const authRouter = express.Router();

const authController = require("../controllers/auth.controller");
const { authMiddleware } = require('../middlewares/auth.middleware');

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authMiddleware, authController.logout);

module.exports = authRouter;