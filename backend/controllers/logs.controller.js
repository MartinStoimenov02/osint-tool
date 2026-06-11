const LogModel = require('../models/log.model.js');
const logError = require('../utils/logger.js');

exports.getAllLogs = async (req, res, next) => {
    try {
        const logsList = await LogModel.find()
            // заменя ID-то от колекция feedback на потребителя с истинския му имейл от колекция user
            .populate('user', 'email')
            // сортира ги в низходящ ред по датата им на създаване
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, logs: logsList });
    } catch (err) {
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'getAllLogs' });
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ success: false, error: 'ERROR_FETCHING_LOGS' });
    }
};

exports.deleteLogById = async (req, res, next) => {
    try {
        await LogModel.findByIdAndDelete(req.params.id);
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(200).json({ success: true, message: 'LOG_DELETED' });
    } catch (err) {
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'deleteLogById' });
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ success: false, error: 'ERROR_DELETING_LOG' });
    }
};

exports.deleteMultipleLogs = async (req, res, next) => {
    const { ids } = req.body;
    try {
        await LogModel.deleteMany({ _id: { $in: ids } });
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(200).json({ success: true, message: 'MULTIPLE_LOGS_DELETED' });
    } catch (err) {
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'deleteMultipleLogs' });
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ success: false, error: 'ERROR_DELETING_MULTIPLE_LOGS' });
    }
};