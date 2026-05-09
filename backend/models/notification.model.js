const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const NotificationModel = mongoose.model('notification', NotificationSchema);

module.exports = NotificationModel;