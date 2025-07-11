const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../utils/cloudinary');

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
    res.status(200).json(new ApiResponse(200, {user}, 'User logged in successfully'));
});

//@Desc: Logout user and clear tokens
//@Route: POST /api/v1/users/logout
//@Access: Public

const logoutUser = asyncHandler(async (req, res) => {});

//@Desc: Refresh acces token with refresh token
//@Route: POST /api/v1/users/refesh-token
//@Access: Public

const refreshAccessToken = asyncHandler(async (req, res) => {});


//@Desc: Change user password
//@Route: POST /api/v1/users/change-password
//@Access: Private

const changePassword = asyncHandler(async (req, res) => {});

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