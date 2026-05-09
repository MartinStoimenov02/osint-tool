const express = require('express');
const { 
    getAllLogs, 
    deleteLogById, 
    deleteMultipleLogs 
} = require('../controllers/logs.controller.js');

// Импортираме защитата
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

/**
 * АДМИН ЛОГОВЕ - ПЪЛНА ЗАЩИТА
 * Всички рутове тук изискват ТОКЕН + АДМИНСКИ ПРАВА.
 * Никой обикновен потребител не трябва да знае, че тези пътища съществуват.
 */

router.get('/getAllLogs', authMiddleware, adminMiddleware, getAllLogs);
router.delete('/deleteLogById/:id', authMiddleware, adminMiddleware, deleteLogById);
router.post('/deleteMultipleLogs', authMiddleware, adminMiddleware, deleteMultipleLogs);

module.exports = router;