const dotenv = require('dotenv');

dotenv.config();

if (!process.env.MONGO_DB_URI) {
    throw new Error('MONGO_DB_URI is not defined in the environment variables');
}

if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not defined in the environment variables');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not defined in the environment variables');
}

if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not defined in the environment variables');
}

if (!process.env.GOOGLE_USER_EMAIL) {
    throw new Error('GOOGLE_USER_EMAIL is not defined in the environment variables');
}

const config = {
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER_EMAIL: process.env.GOOGLE_USER_EMAIL,
};

module.exports = config;