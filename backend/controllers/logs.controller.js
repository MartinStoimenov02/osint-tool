const LogModel = require('../models/log.model.js');
const logError = require('../utils/logger.js');

exports.getAllLogs = async (req, res, next) => {
    try {
        const logsList = await LogModel.find()
            .populate('user', 'email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, logs: logsList });
    } catch (err) {
        next(err);
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'getAllLogs' });
        res.status(500).json({ success: false, error: 'ERROR_FETCHING_LOGS' });
    }
};

exports.deleteLogById = async (req, res, next) => {
    try {
        await LogModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'LOG_DELETED' });
    } catch (err) {
        next(err);
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'deleteLogById' });
        res.status(500).json({ success: false, error: 'ERROR_DELETING_LOG' });
    }
};

exports.deleteMultipleLogs = async (req, res, next) => {
    const { ids } = req.body;
    try {
        await LogModel.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ success: true, message: 'MULTIPLE_LOGS_DELETED' });
    } catch (err) {
        next(err);
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'deleteMultipleLogs' });
        res.status(500).json({ success: false, error: 'ERROR_DELETING_MULTIPLE_LOGS' });
    }
};