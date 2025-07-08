const mongoose = require('mongoose');
const appConfig = require('./appConfig');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(appConfig.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;