const appConfig = require("../config/appConfig");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req?.cookies?.accessToken || req?.headers('authorization')?.replace('Bearer ', '');
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
        throw new ApiError(401, error?.message || 'Invalid access token');
    }
});

module.exports = verifyJWT;