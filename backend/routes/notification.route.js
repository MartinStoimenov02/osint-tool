const express = require('express');
const { 
    addNotification, 
    addUserNotification, 
    getNotificationsForUser, 
    markAsRead 
} = require('../controllers/notification.controller.js');

// Импортираме защитата
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- АДМИН РУТОВЕ (Изискват токен + isAdmin: true) ---
// Само админ може да създава нови нотификации в системата
router.post('/addNotification', authMiddleware, adminMiddleware, addNotification);
router.post('/addUserNotification', authMiddleware, adminMiddleware, addUserNotification);

// --- ПОТРЕБИТЕЛСКИ РУТОВЕ (Изискват само логнат профил) ---
// Всеки логнат потребител може да вижда своите известия и да ги отбелязва като прочетени
router.get('/getNotificationsForUser', authMiddleware, getNotificationsForUser);
router.patch('/markAsRead', authMiddleware, markAsRead);

module.exports = router;