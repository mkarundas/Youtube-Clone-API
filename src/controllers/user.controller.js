const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../utils/cloudinary');
const appConfig = require('../config/appConfig');
const jwt = require("jsonwebtoken");

// Internal utility functions to generate JWT tokens

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Failed to generate tokens');
    }
}

//@Desc: Register a new user with optional avatar and cover image
//@Route: POST /api/v1/users/register
//@Access: Public

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullName, email, password } = req.body;

    if(!username || !fullName || !email || !password) {
        throw new ApiError(400, 'All fields are required');
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });   
    if (existingUser) {
        throw new ApiError(409, 'Username or email already exists');
    }

    let avatarLocalPath;
    let avatarUpload = {};

    if(req.files && req.files.avatar && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
        const uploadResult = await uploadToCloudinary(avatarLocalPath, 'youtube/avatars');
        if(!uploadResult) {
            throw new ApiError(500, 'Failed to upload avatar');
        }

        avatarUpload = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
        };
    }

    let coverImageLocalPath;
    let coverImageUpload = {};

    if(req.files && req.files.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
        const uploadResult = await uploadToCloudinary(coverImageLocalPath, 'youtube/cover-images');
        if(!uploadResult) {
            throw new ApiError(500, 'Failed to upload cover image');
        }

        coverImageUpload = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
        };
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: Object.keys(avatarUpload).length ? avatarUpload : undefined,
        coverImage: Object.keys(coverImageUpload).length ? coverImageUpload : undefined
    });

    // Remove password and refresh token from response
    const createdUser = await User.findById(user._id).select('-password -refreshToken');
    if(!createdUser) {
        throw new ApiError(500, 'Failed to create user');
    }

    return res.status(201).json(new ApiResponse(201, createdUser, 'User registered successfully'));
});

//@Desc: Login user and generate tokens
//@Route: POST /api/v1/users/login
//@Access: Public

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if(!username && !email) {
        throw new ApiError(400, 'Username or email is required');
    }

    if(!password) {
        throw new ApiError(400, 'Password is required');
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if(!user) {
        throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');
    const cookieOptions = {
        httpOnly: true,
        secure: appConfig.nodeEnv === 'production',
        sameSite: 'Strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(200, {loggedInUser, accessToken, refreshToken}, 'User logged in successfully'));
});

//@Desc: Logout user and clear tokens
//@Route: POST /api/v1/users/logout
//@Access: Public

const logoutUser = asyncHandler(async (req, res) => {
    console.log(req.cookies);
    console.log(req.headers);
    await User.findOneAndUpdate(
        { _id: req.user._id },
        { refreshToken: null },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: appConfig.nodeEnv === 'production',
        sameSite: 'Strict',
    };

    return res
    .status(200)
    .cookie('accessToken', cookieOptions)
    .cookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

//@Desc: Refresh acces token with refresh token
//@Route: POST /api/v1/users/refesh-token
//@Access: Public

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.headers('authorization')?.replace('Bearer ', '');
    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token is required');
    }

    const decodedToken = jwt.verify(refreshToken, appConfig.refreshTokenSecret);
    if (!decodedToken) {
        throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await User.findById(decodedToken._id).select('-password');
    if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
    const cookieOptions = {
        httpOnly: true,
        secure: appConfig.nodeEnv === 'production',
        sameSite: 'Strict',
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, {accessToken, refreshToken}, 'Access token refreshed successfully'));
});


//@Desc: Change user password
//@Route: POST /api/v1/users/change-password
//@Access: Private

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, 'Current and new passwords are required');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
});

//@Desc: Get current user profile
//@Route: GET /api/v1/users/current
//@Access: Private

const getCurrentUser = asyncHandler(async (req, res) => {});


//@Desc: Update user profile details
//@Route: PATCH /api/v1/users/current
//@Access: Private

const updateAccountDetails = asyncHandler(async (req, res) => {});

//@Desc: Update user's avatar
//@Route: PATCH /api/v1/users/avatar
//@Access: Private

const updateAvatar = asyncHandler(async (req, res) => {});

//@Desc: Update user's cover image
//@Route: PATCH /api/v1/users/cover-image
//@Access: Private

const updateCoverImage = asyncHandler(async (req, res) => {});

//@Desc: Get user's channel profile
//@Route: GET /api/v1/users/cover-image
//@Access: Private

const getUserChannelProfile = asyncHandler(async (req, res) => {});

//@Desc: Get user's watch history
//@Route: GET /api/v1/users/watch-history
//@Access: Private

const getUserWatchHistory = asyncHandler(async (req, res) => {});

//@Desc: Request password reset email
//@Route: POST /api/v1/users/request-reset-password
//@Access: Private

const requestPasswordReset = asyncHandler(async (req, res) => {});

//@Desc: Request password using reset token
//@Route: POST /api/v1/users/reset-password/:token
//@Access: Private

const resetPassword = asyncHandler(async (req, res) => {});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
  requestPasswordReset,
  resetPassword
};