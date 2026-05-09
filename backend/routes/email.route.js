const express = require('express');
const { 
    sendVerificationCode, 
    verifyCode, 
    sendNotificationEmail 
} = require('../controllers/email.controller.js');

// Импортираме защитата
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- ПУБЛИЧНИ РУТОВЕ (За регистрация и забравена парола) ---
// Тези трябва да са достъпни без токен, за да може нов потребител да се регистрира
router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);

// --- ЗАЩИТЕНИ/АДМИН РУТОВЕ ---
/**
 * Изпращането на произволни нотификационни имейли трябва да е строго ограничено.
 * Ако го оставиш публичен, някой може да ползва твоя сървър за SPAM ботнет 
 * и да ти блокират имейл хостинга (SendGrid/Gmail/Nodemailer).
 */
router.post("/sendNotificationEmail", authMiddleware, adminMiddleware, sendNotificationEmail);

module.exports = router;