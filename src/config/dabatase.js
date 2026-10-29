const mongoose = require('mongoose');
const config = require('./config');

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_DB_URI)
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectDB;