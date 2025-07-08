require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Express initialization
const app = express();

//Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});