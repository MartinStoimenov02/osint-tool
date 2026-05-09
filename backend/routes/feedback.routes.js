const express = require('express');
const { 
    createFeedback, 
    getAllFeedback, 
    deleteFeedbackById, 
    deleteMultipleFeedback 
} = require('../controllers/feedback.controller.js');

const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.post('/createFeedback', authMiddleware, createFeedback);
router.get('/getAllFeedback', authMiddleware, adminMiddleware, getAllFeedback);
router.delete('/deleteFeedbackById/:id', authMiddleware, adminMiddleware, deleteFeedbackById);
router.post('/deleteMultipleFeedback', authMiddleware, adminMiddleware, deleteMultipleFeedback);

module.exports = router;