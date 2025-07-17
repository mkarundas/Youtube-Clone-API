const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const appConfig = require('../config/appConfig');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },

    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        index: true,
    },

    avatar: {
        public_id: String,
        url: String,
    },

    coverImage: {
        public_id: String,
        url: String,
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
    },

    refreshToken: {
        type: String,
    },

    watchHistory: [
        {
            videoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video',
            },
        },
    ],

    isVerified: {
        type: Boolean,
        default: false,
    },

    channelDescription: {
        type: String,
        default: '',
        trim: true,
    },

    channelTags: {
        type: [String],
        default: [],
    },

    sociakLinks: {
        x: String,
        facebook: String,
        instagram: String,  
        website: String,
    },

    notificationSettings: {
        emailNotifications: {
            type: Boolean,
            default: true,
        },
        subscriptionActivity: {
            type: Boolean,
            default: true,
        },
        commentActivity: {
            type: Boolean,
            default: true,
        },
    },

    refreshPasswordToken: String,

    resetPasswordExpiry: String,

    isAdmin: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Pre save hook to hash password before saving
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//  Method to compare password
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function() {
    const payload = {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
    };
    return jwt.sign(payload, appConfig.accessTokenSecret, {
        expiresIn: appConfig.accessTokenExpirry,
    });
};  

// Method to generate fefresh token
userSchema.methods.generateRefreshToken = function() {
    const payload = {
        _id: this._id,
    };
    return jwt.sign(payload, appConfig.refreshTokenSecret, {
        expiresIn: appConfig.refreshTokenExpirry,
    });
};  

const User = mongoose.model('User', userSchema);

module.exports = User;