const express = require('express');
const osintController = require('../controllers/osintController');
const companyController = require('../controllers/companyController');
const socialController = require('../controllers/socialController');

// Импортираме защитата
const { authMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

/**
 * Всички OSINT модули трябва да са защитени с authMiddleware.
 * Така само логнати потребители с валиден JWT токен могат да правят заявки.
 */

// --- GitHub Module (Individual Recon) ---
router.get('/searchUsers', authMiddleware, osintController.searchUsers);
router.get('/analyzeUser', authMiddleware, osintController.analyzeUser);

// --- Hunter.io Module (Corporate Recon) ---
router.get('/searchCompany', authMiddleware, companyController.searchByDomain);
router.get('/findPerson', authMiddleware, companyController.findPersonEmail);
router.get('/scanSocials', authMiddleware, socialController.scanUsername);

module.exports = router;