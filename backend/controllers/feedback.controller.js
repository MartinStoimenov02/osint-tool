const FeedbackModel = require('../models/feedback.model.js');
const logError = require('../utils/logger.js');

exports.createFeedback = async (req, res, next) => {
    const { userId, feedbackType, message, rating } = req.body;

    try {
        const newFeedback = new FeedbackModel({
            user: userId, 
            feedbackType,
            message,
            rating,
        });

        await newFeedback.save();

        res.status(201).json({
            success: true,
            message: 'FEEDBACK_CREATED',
        });
    } catch (err) {
        next(err);
        logError(err, req, { className: 'feedback.controller', functionName: 'createFeedback', user: req.body.userId });
        console.error("Error creating feedback:", err);
        res.status(500).json({
            success: false,
            error: 'ERROR_CREATING_FEEDBACK',
        });
    }
};

exports.getAllFeedback = async (req, res, next) => {
    try {
      const feedbackList = await FeedbackModel.find()
        .populate('user', 'email') 
        .sort({ createdAt: 1 }); 
  
      res.status(200).json({ success: true, feedback: feedbackList });
    } catch (err) {
      next(err);
      console.error(err);
      logError(err, req, { className: 'feedback.controller', functionName: 'getAllFeedback' });
      res.status(500).json({ success: false, error: 'ERROR_FETCHING_FEEDBACK' });
    }
};
  
exports.deleteFeedbackById = async (req, res, next) => {
    try {
      await FeedbackModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: 'FEEDBACK_DELETED' });
    } catch (err) {
      next(err);
      console.error(err);
      logError(err, req, { className: 'feedback.controller', functionName: 'deleteFeedbackById' });
      res.status(500).json({ success: false, error: 'ERROR_DELETING_FEEDBACK' });
    }
};
  
exports.deleteMultipleFeedback = async (req, res, next) => {
    const { ids } = req.body;
    try {
      await FeedbackModel.deleteMany({ _id: { $in: ids } });
      res.status(200).json({ success: true, message: 'MULTIPLE_FEEDBACK_DELETED' });
    } catch (err) {
      next(err);
      console.error(err);
      logError(err, req, { className: 'feedback.controller', functionName: 'deleteMultipleFeedback' });
      res.status(500).json({ success: false, error: 'ERROR_DELETING_MULTIPLE_FEEDBACK' });
    }
};