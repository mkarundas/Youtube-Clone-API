const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    video: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Video is required'],
        ref: 'Video',
    },

    comment: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Comment is required'],
        ref: 'Comment',
    },

    likedBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Ensure like must refer to either a video or a comment and not both
likeSchema.pre('save', function (next) {
    if (!this.video && !this.comment) {
        return next(new Error('Like must refer to either a video or a comment'));
    }
    if (this.video && this.comment) {
        return next(new Error('Like cannot refer to both a video and a comment'));
    }
    next();
});

// Compound index to ensure unique likes per user per video/comment
likeSchema.index({ likedBy: 1, video: 1 }, { unique: true, sparse: true});
likeSchema.index({ likedBy: 1, comment: 1 }, { unique: true, sparse: true});


const Like = mongoose.model('Like', likeSchema);

module.exports = Like;