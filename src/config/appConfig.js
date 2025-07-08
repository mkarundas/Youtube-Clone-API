require('dotenv').config();

const appConfig = {
  PORT: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-clone',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpirry: process.env.ACCESS_TOKEN_EXPIRY,
  refreshTokenExpirry: process.env.REFRESH_TOKEN_EXPIRY,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  corsOrgin: process.env.CLOUDINARY_CORS_ORIGIN,
}

module.exports = appConfig;
