const express = require('express');
const cookieParser = require('cookie-parser');
const { registerUser,
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
    resetPassword } = require('../controllers/user.controller');
const upload = require('../middlewares/multer.middleware');
const verifyJWT = require('../middlewares/auth.middleware');
const userRouter = express.Router();

// Public routes
userRouter.post('/register', upload.fields([{name: 'avatar', maxCount: 1}, {name: 'coverImage', maxCount: 1}]), registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/refresh-token', refreshAccessToken);  

// Private routes

// Password reset routes
userRouter.post('/request-password-reset', requestPasswordReset);
userRouter.post('/reset-password', resetPassword); 

// Protected routes
userRouter.use(verifyJWT); // Apply JWT verification middleware to all routes below
userRouter.post('/logout', logoutUser);
userRouter.get('/current-user', getCurrentUser);
userRouter.patch('/change-password', changePassword);
userRouter.patch('/update-account', updateAccountDetails);

// Avatar and cover image routes
userRouter.patch('/avatar', upload.single('avatar'), updateAvatar);
userRouter.patch('/cover-image', upload.single('coverImage'), updateCoverImage);

// Channel routes
userRouter.get('/c/:username', getUserChannelProfile);
userRouter.get('/history', getUserWatchHistory);

module.exports = userRouter;


