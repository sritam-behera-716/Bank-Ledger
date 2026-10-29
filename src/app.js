const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authRouter = require('./routes/auth.route')
const accountRouter = require('./routes/account.route')
const transactionRouter = require('./routes/transaction.route')

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get("/", (req, res) => {
    res.send("Bank Ledger is running perfectly");
})

app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", transactionRouter)

module.exports = app;