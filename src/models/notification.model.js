const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receipient: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Receipient is required'],
        ref: 'User',
    },

    sender: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Receipient is required'],
        ref: 'User',
    },

    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: ['SUBSCRIPTION', 'COMMENT', 'REPLY', 'VIDEO'],
    },

    content: {
        type: String,
        required: [true, 'Content is required'],
    },

    read: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;