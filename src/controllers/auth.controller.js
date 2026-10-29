const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const emailService = require("../services/email.service");
const blackListModel = require("../models/blacklist.model")

/**
 * - User registration controller
 * - POST - /api/auth/register
 */
async function register(req, res) {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(422).json({ message: "Email already exists", status: "failed" });
    }

    const user = await userModel.create({ name, email, password });
    
    const token = jwt.sign({id: user._id}, config.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Set to true in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({ message: "User registered successfully", user: { id: user._id, name: user.name, email: user.email } });
    
    await emailService.sendRegistrationEmail(user.email, user.name);
}

async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password", status: "failed" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password", status: "failed" });
    }

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
}

async function logout(req, res) {

    await blackListModel.create({token: req.cookies.token})

    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful"});
}

module.exports = {
    register,
    login,
    logout
}