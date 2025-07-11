require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRouter = require('./routes/user.routes');

// Express initialization
const app = express();

//Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/v1/users', userRouter); 

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});