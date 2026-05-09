const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // Коригирано за по-добра практика
        ref: "user",
    },
    errorStatus: {
        type: String
    },
    errorMessage: {
        type: String,
    },
    stackTrace: { 
        type: String, 
        required: true 
    },
    className: {
        type: String,
    },
    functionName: {
        type: String,
    },
    requestData: { 
        type: mongoose.Schema.Types.Mixed, 
        required: false 
    }
}, { timestamps: true });

const LogModel = mongoose.model('logs', LogSchema);

module.exports = LogModel;