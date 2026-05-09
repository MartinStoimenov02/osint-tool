const express = require('express');
const { 
    createUser, getUser, validateUser, checkUserExists, 
    resetPassword, googleAuth, updateField, 
    deleteAccount, getAllUsers, updateUser,
    generate2FA, verify2FASetup, verify2FALogin, disable2FA,
    approveUser, rejectUser // --- НОВИ: Импортираме функциите за одобрение ---
} = require("../controllers/user.controller.js");

const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware.js');
const router = express.Router();

// --- ПУБЛИЧНИ РУТОВЕ ---
router.post("/getUser", getUser);
router.post("/validateUser", validateUser);
router.post("/createUser", createUser);
router.post("/checkUserExists", checkUserExists);
router.post("/resetPassword", resetPassword);
router.post("/googleAuth", googleAuth);

// Новият рут за логване с 2FA код (публичен, защото нямаш JWT все още)
router.post("/verify-2fa-login", verify2FALogin);

// --- ЗАЩИТЕНИ РУТОВЕ ---
router.put("/updateField", authMiddleware, updateField);
router.post("/deleteAccount", authMiddleware, deleteAccount);

// Нови рутове за настройка на 2FA от Профила
router.post("/generate-2fa", authMiddleware, generate2FA);
router.post("/verify-2fa-setup", authMiddleware, verify2FASetup);
router.post("/disable-2fa", authMiddleware, disable2FA);

// --- АДМИН РУТОВЕ ---
router.get('/getAllUsers', authMiddleware, adminMiddleware, getAllUsers);
router.put('/updateUser/:id', authMiddleware, adminMiddleware, updateUser);

// --- НОВИ АДМИН РУТОВЕ ЗА ОДОБРЕНИЕ ---
router.put('/approveUser/:id', authMiddleware, adminMiddleware, approveUser);
router.delete('/rejectUser/:id', authMiddleware, adminMiddleware, rejectUser);

module.exports = router;