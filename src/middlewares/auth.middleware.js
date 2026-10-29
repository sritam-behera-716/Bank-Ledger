const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const blackListModel = require("../models/blacklist.model")

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access", status: "failed" });
    }

    const isBlackListed = await blackListModel.findOne({token})
    if (isBlackListed) {
        return res.status(401).json({message: "Unauthorized access & token black listed", status: "failed" })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found", status: "failed" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token", status: "failed" });
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access", status: "failed" });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);

        const user = await userModel.findById(decoded.id).select("+systemUser");
        if (!user.systemUser) {
            return res.status(403).json({ message: "You are not a system user", status: "failed" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token", status: "failed" });
    }
}

module.exports = {authMiddleware, authSystemUserMiddleware};