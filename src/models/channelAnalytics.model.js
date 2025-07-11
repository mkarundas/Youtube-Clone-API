const mongoose = require('mongoose');

const channelAnalyticalSchema = new mongoose.Schema({
    channel: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },

    totalViews: {
        type: Number,
        default: 0,
    },

    totalSubscribers: {
        type: Number,
        default: 0,
    },

    totalVideos: {
        type: Number,
        default: 0,
    },

    totalLikes: {
        type: Number,
        default: 0,
    },

    totalComments: {
        type: Number,
        default: 0,
    },

    dailyStatitics: [{
        date: { type: Date, required: true },
        views: { type: Number, default: 0 },
        subscribersGained: { type: Number, default: 0 },
        subscribersLost: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
    }]
}, {
    timestamps: true,
});

// Index for faster lookups
channelAnalyticalSchema.index({ channel: 1, video: 1 });

const ChannelAnalytics = mongoose.model('ChannelAnalytics', channelAnalyticalSchema);

module.exports = ChannelAnalytics;