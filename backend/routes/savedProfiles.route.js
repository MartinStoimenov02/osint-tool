const express = require('express');
const savedProfileController = require('../controllers/savedProfileController');
const { authMiddleware } = require('../middleware/auth.middleware.js'); // Сложи точния път

const router = express.Router();

// POST заявка за запазване (защищена с токен)
router.post('/save', authMiddleware, savedProfileController.saveProfile);
router.get('/my-profiles', authMiddleware, savedProfileController.getSavedProfiles);
router.delete('/delete/:target', authMiddleware, savedProfileController.deleteSavedProfile);

module.exports = router;