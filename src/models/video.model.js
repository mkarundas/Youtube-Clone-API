const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const videoSchema = new mongoose.Schema({
    videoFile: {
        public_id: {
            type: String,
            required: true
        },

        url: {
            type: String,
            required: true
        }
    },

    thumbnail: {
        public_id: {
            type: String,
            required: true
        },

        url: {
            type: String,
            required: true
        }
    },

    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        index: true,
    },

    description: {
        type: String,
        required: true,
    },

    duration: {
        type: Number,
        required: true,
    },

    views: {
        type: Number,
        default: 0,
    },

    shares: {
        type: Number,
        default: 0,
    },

    isPublished: {
        type: String,
        required: true,
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    tags: [{
        type: String,
        trim: true,
    }],}
, {
    timestamps: true,
});

videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;