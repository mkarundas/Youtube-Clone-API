const appConfig = require("../config/appConfig");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req?.cookies?.accessToken || req?.headers?.authorization?.split(' ')[1];
        console.log("Token:", token);
        if (!token) {
            throw new ApiError(401, 'Unauthorized access');
        }
        const decodedToken = jwt.verify(token, appConfig.accessTokenSecret);
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');  
        if (!user) {
            throw new ApiError(401, 'Invalid access token');
        } 
        req.user = user;
        next();
    } catch (error) {
        if(req.path === "/logiut") {
            const cookieOptions = {
                httpOnly: true,
                secure: appConfig.nodeEnv === 'production',
                sameSite: 'Strict',
                path: '/',
                expires: new Date(0) // Clear the cookie by setting an expiration date in the past
            }
            res.clearCookie('accessToken', cookieOptions);
            res.clearCookie('refreshToken', cookieOptions);
            return res.status(200).json({ message: 'User logged out successfully', success: true });
        }
        throw new ApiError(401, error?.message || 'Invalid access token');
    }
});

module.exports = verifyJWT;