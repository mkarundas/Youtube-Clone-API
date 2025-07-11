const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const commentSchema = new mongoose.Schema({

    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
    },

    video: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Video is required'],
        ref: 'Video',
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User is required'],
        ref: 'User',
    },

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    }
, {
    timestamps: true,
});

commentSchema.plugin(mongooseAggregatePaginate);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;