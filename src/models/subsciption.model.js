const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },}
, {
    timestamps: true,
});

// Compound index to ensure unique subscriptions
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

const subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = subscription;