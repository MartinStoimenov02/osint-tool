const express = require('express');
const { 
    sendVerificationCode, 
    verifyCode, 
    sendNotificationEmail 
} = require('../controllers/email.controller.js');

// Импорт на защитата
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- ПУБЛИЧНИ РУТОВЕ (За регистрация и забравена парола) ---
// Тези трябва да са достъпни без токен, за да може нов потребител да се регистрира
router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);

// --- ЗАЩИТЕНИ/АДМИН РУТОВЕ ---
/**
 * Изпращането на произволни нотификационни имейли трябва да е строго ограничено,
 * за да не се използва сървъра за SPAM ботнет 
 * и да блокира имейл хостинга.
 */
router.post("/sendNotificationEmail", authMiddleware, adminMiddleware, sendNotificationEmail);

module.exports = router;