const UserModel = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const mongoose = require("mongoose");
const logError = require('../utils/logger.js');
const deleteUserAndRelatedData = require('../utils/deleteUserAndRelatedData.js');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// ВАЖНО: Импортираме функцията за изпращане на имейли
const { sendEmail } = require('../utils/email.js');

// Хешираща функция (SHA-256)
const hashPassword = (password) => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

// Функция за генериране на JWT токен
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Токенът важи 24 часа
    );
};

const checkUserExists = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (user) {
            return res.status(200).json({ success: true, exists: true });
        } else {
            return res.status(200).json({ success: true, exists: false });
        }
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'checkUserExists', user: req.body.email });
        console.error("checkUserExists: ", err);
        return res.status(500).json({ success: false, error: "ERROR_CHECKING_USER" });
    }
};

const getUser = async (req, res, next) => {
    console.log("getUser")
    try {
        const { email, password } = req.body;
        const hashedPassword = hashPassword(password);
        const user = await UserModel.findOne({ 
            email: email,
            password: hashedPassword
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'INVALID_CREDENTIALS'
            });
        }

        // --- ПРОВЕРКА ЗА ОДОБРЕНИЕ ---
        if (!user.isAccepted && !user.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                error: 'ACCOUNT_NOT_APPROVED' 
            });
        }

        // --- 2FA ПРОВЕРКА ---
        if (user.isTwoFactorEnabled) {
            return res.status(200).json({
                success: true,
                requires2FA: true,
                userId: user._id,
                message: "2FA_REQUIRED"
            });
        }

        // Генерираме JWT токен при успешен вход
        const token = generateToken(user);

        user.lastLogin = new Date();
        await user.save();
        
        res.json({
            success: true,
            message: "LOGIN_SUCCESS",
            token: token, // Пращаме токена към фронтенда
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                points: user.points,
                firstLogin: user.firstLogin,
                isGoogleAuth: user.isGoogleAuth,
                hasPassword: user.password != undefined,
                isAdmin: user.isAdmin,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                isAccepted: user.isAccepted // Връщаме състоянието
            }
        });

    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'getUser', user: req.body.email });
        console.error("error getting user: ", err);
        res.status(500).json({ success: false, error: "SERVER_ERROR_LOGIN" });
    }
};

const validateUser = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction(); 

    try {
        const { name, email, password, phoneNumber } = req.body;
        const hashedPassword = hashPassword(password);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber
        });

        await newUser.save({ session });
        await session.abortTransaction(); 
        res.status(200).json({ success: true, message: "DATA_VALID" });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'validateUser', user: req.body?.email });
        console.error("validateUser: ", err);
        await session.abortTransaction(); 
        if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const errorCode = field === 'email' ? 'EMAIL_ALREADY_EXISTS' : 'PHONE_ALREADY_EXISTS';
        return res.status(409).json({ success: false, error: errorCode });
    }
        res.status(500).json({ success: false, error: "INVALID_DATA" });
    } finally {
        session.endSession();
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, phoneNumber } = req.body;
        const hashedPassword = hashPassword(password);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            isAccepted: false // Потребителят първоначално е неодобрен
        });

        await newUser.save();

        // Изпращаме имейл, че заявката се обработва
        await sendEmail(
            email, 
            "OSI-HR Registration Request",
            `<p>Hello ${name},</p>
            <p>Your registration request has been successfully received.</p>
            <p>An administrator will review your profile within the next 24 hours. You will receive an email as soon as your account is approved.</p>`
        );

        res.status(201).json({
            success: true,
            message: 'REGISTRATION_SUCCESS_PENDING'
        });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'createUser', user: req.body.email });
        console.error("createUser: ", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const errorCode = field === 'email' ? 'EMAIL_ALREADY_EXISTS' : 'PHONE_ALREADY_EXISTS';
            return res.status(409).json({ success: false, error: errorCode });
        } else {
            return res.status(500).json({
                success: false,
                error: "ERROR_CREATING_USER"
            });
        }
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "USER_NOT_FOUND"
            });
        }
        const hashedPassword = hashPassword(password);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "PASSWORD_RESET_SUCCESS"
        });

    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'resetPassword', user: req.body.email });
        console.error("Error resetting password:", err);
        res.status(500).json({
            success: false,
            error: "ERROR_RESETTING_PASSWORD"
        });
    }
};

const googleAuth = async (req, res, next) => {
    try {
        const { email, name, phoneNumber } = req.body.userData;

        let user = await UserModel.findOne({ email });

        if (!user) {
            user = new UserModel({
                name,
                email,
                isGoogleAuth: true,
                isAccepted: false // Google регистрацията също чака одобрение
            });

            if (phoneNumber && phoneNumber.trim() !== "") {
                user.phoneNumber = phoneNumber;
            }

            await user.save();

            // Изпращаме имейл, че заявката се обработва
            await sendEmail(
                email, 
                "OSI-HR Registration Request",
                `<p>Hello ${name},</p>
                <p>Your registration request via Google has been successfully received.</p>
                <p>An administrator will review your profile within the next 24 hours. You will receive an email as soon as you are approved.</p>`
            );
        }

        // --- ПРОВЕРКА ЗА ОДОБРЕНИЕ ПРИ GOOGLE ВХОД ---
        if (!user.isAccepted && !user.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                error: 'ACCOUNT_NOT_APPROVED' 
            });
        }

        // --- 2FA ПРОВЕРКА ПРИ GOOGLE ВХОД ---
        if (user.isTwoFactorEnabled) {
            return res.status(200).json({
                success: true,
                requires2FA: true,
                userId: user._id,
                message: "2FA_REQUIRED"
            });
        }

        user.lastLogin = new Date();
        await user.save();

        // Генерираме JWT токен и за Google потребителя
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "GOOGLE_LOGIN_SUCCESS",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || null,
                isGoogleAuth: user.isGoogleAuth,
                firstLogin: user.firstLogin,
                points: user.points,
                hasPassword: user.password != undefined,
                isAdmin: user.isAdmin,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                isAccepted: user.isAccepted // Връщаме състоянието
            }
        });

    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'googleAuth', user: req.body.userData?.email });
        console.error("Error in Google Auth:", err);
        res.status(500).json({
            success: false,
            error: "GOOGLE_AUTH_ERROR"
        });
    }
};

const updateField = async (req, res, next) => {
    const { id, field, newValue } = req.body;

    try {
        const user = await UserModel.findById(id);
  
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "USER_NOT_FOUND"
            });
        }
  
        if (field === "password") {
            user.password = hashPassword(newValue);
        } else if (["name", "phoneNumber", "email", "firstLogin"].includes(field)) {
            user[field] = newValue;
        } else {
            return res.status(400).json({
                success: false,
                error: "INVALID_FIELD"
            });
        }
  
        await user.save();
  
        res.status(200).json({
            success: true,
            message: "FIELD_UPDATED_SUCCESS"
        });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'updateUserField', user: req.body.id });
        console.error("Error updating user field:", err);
        res.status(500).json({
            success: false,
            error: "ERROR_UPDATING_FIELD"
        });
    }
};
  
const deleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await deleteUserAndRelatedData(userId);

    if (!result.success) throw new Error(result.error);

    res.status(200).json({ success: true, message: "ACCOUNT_DELETED_SUCCESS" });
  } catch (err) {
    logError(err, req, { className: 'user.controller', functionName: 'deleteAccount' });
    console.error("Error deleting user account:", err);
    res.status(500).json({ success: false, error: "ERROR_DELETING_ACCOUNT" });
  }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find();
        res.json({ success: true, users });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'getAllUsers' });
        console.error("Error getting users:", err);
        res.status(500).json({ success: false, error: 'ERROR_FETCHING_USERS' });
    }
};
  
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await UserModel.findByIdAndUpdate(id, updates);
        res.json({ success: true, message: 'USER_UPDATED_SUCCESS' });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'updateUser' });
        console.error("Error updating user:", err);
        res.status(500).json({ success: false, error: 'ERROR_UPDATING_USER' });
    }
};

// --- НОВИ 2FA ФУНКЦИИ ---

const generate2FA = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: "USER_NOT_FOUND" });

        if (user.isTwoFactorEnabled) {
            return res.status(400).json({ success: false, error: "2FA_ALREADY_ENABLED" });
        }

        const secret = speakeasy.generateSecret({ name: `OSI-HR (${user.email})` });
        
        const recoveryCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString('hex'));

        user.twoFactorSecret = secret.base32;
        user.twoFactorRecoveryCodes = recoveryCodes.map(code => hashPassword(code));
        await user.save();

        const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.status(200).json({
            success: true,
            qrCode: qrCodeDataUrl,
            secret: secret.base32,
            recoveryCodes: recoveryCodes
        });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'generate2FA' });
        res.status(500).json({ success: false, error: "ERROR_GENERATING_2FA" });
    }
};

const verify2FASetup = async (req, res, next) => {
    try {
        const { userId, token } = req.body;
        const user = await UserModel.findById(userId);

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            user.isTwoFactorEnabled = true;
            await user.save();

            // --- НОВО: Изпращаме имейл за успешно активиране ---
            await sendEmail(
                user.email,
                "Security Update: Two-Factor Authentication Enabled",
                `<p>Hello ${user.name},</p>
                <p>Two-Factor Authentication (2FA) has been successfully enabled for your OSI-HR account.</p>
                <p>Your account is now more secure. If you did not make this change, please contact an administrator immediately.</p>`
            );

            res.status(200).json({ success: true, message: "2FA_ACTIVATED_SUCCESS" });
        } else {
            res.status(400).json({ success: false, error: "INVALID_2FA_CODE" });
        }
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'verify2FASetup' });
        res.status(500).json({ success: false, error: "ERROR_VERIFYING_2FA_SETUP" });
    }
};

const verify2FALogin = async (req, res, next) => {
    try {
        const { userId, token } = req.body;
        const user = await UserModel.findById(userId);

        if (!user || !user.isTwoFactorEnabled) {
            return res.status(400).json({ success: false, error: "INVALID_REQUEST" });
        }

        const cleanToken = token.replace(/\s+/g, '');

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: cleanToken,
            window: 2
        });

        let isRecovery = false;
        
        if (!verified) {
            const hashedToken = hashPassword(cleanToken);
            if (user.twoFactorRecoveryCodes.includes(hashedToken)) {
                isRecovery = true;
                user.twoFactorRecoveryCodes = user.twoFactorRecoveryCodes.filter(c => c !== hashedToken);
            }
        }

        if (verified || isRecovery) {
            user.lastLogin = new Date();
            await user.save();

            const jwtToken = generateToken(user);

            res.status(200).json({
                success: true,
                message: "LOGIN_SUCCESS",
                token: jwtToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    points: user.points,
                    firstLogin: user.firstLogin,
                    isGoogleAuth: user.isGoogleAuth,
                    hasPassword: user.password != undefined,
                    isAdmin: user.isAdmin,
                    isTwoFactorEnabled: user.isTwoFactorEnabled,
                    isAccepted: user.isAccepted // Връщаме състоянието
                }
            });
        } else {
            res.status(400).json({ success: false, error: "INVALID_2FA_CODE" });
        }
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'verify2FALogin' });
        res.status(500).json({ success: false, error: "ERROR_VERIFYING_2FA_LOGIN" });
    }
};

const disable2FA = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const user = await UserModel.findById(userId);
        
        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorRecoveryCodes = [];
        await user.save();

        await sendEmail(
            user.email,
            "Security Alert: Two-Factor Authentication Disabled",
            `<p>Hello ${user.name},</p>
            <p>Two-Factor Authentication (2FA) has been <b>disabled</b> for your OSI-HR account.</p>
            <p>Your account is now less secure. If you did not authorize this action, please contact an administrator immediately and change your password.</p>`
        );

        res.status(200).json({ success: true, message: "2FA_DISABLED_SUCCESS" });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'disable2FA' });
        res.status(500).json({ success: false, error: "ERROR_DISABLING_2FA" });
    }
};

// --- НОВИ ФУНКЦИИ ЗА ОДОБРЯВАНЕ ОТ АДМИН ---

const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ success: false, error: "USER_NOT_FOUND" });

        user.isAccepted = true;
        await user.save();

        await sendEmail(
            user.email,
            "Your OSI-HR profile has been approved!",
            `<p>Hello ${user.name},</p>
            <p>We are pleased to inform you that your profile is now active.</p>
            <p>You can now log into the system and start working.</p>`
        );

        res.json({ success: true, message: "USER_APPROVED_SUCCESS" });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'approveUser' });
        res.status(500).json({ success: false, error: "ERROR_APPROVING_USER" });
    }
};

const rejectUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ success: false, error: "USER_NOT_FOUND" });

        const email = user.email;
        const name = user.name;

        await deleteUserAndRelatedData(id);

        await sendEmail(
            email,
            "Information regarding your OSI-HR request",
            `<p>Hello ${name},</p>
            <p>Unfortunately, your registration request for our platform has been rejected.</p>
            <p>For more information, please contact an administrator at martinstoimenov02@gmail.com.</p>`
        );

        res.json({ success: true, message: "USER_REJECTED_SUCCESS" });
    } catch (err) {
        logError(err, req, { className: 'user.controller', functionName: 'rejectUser' });
        res.status(500).json({ success: false, error: "ERROR_REJECTING_USER" });
    }
};

module.exports = {
    checkUserExists,
    getUser,
    validateUser,
    createUser,
    resetPassword,
    googleAuth,
    updateField,
    deleteAccount,
    getAllUsers,
    updateUser,
    generate2FA,
    verify2FASetup,
    verify2FALogin,
    disable2FA,
    approveUser,  // Експортираме новата функция
    rejectUser    // Експортираме новата функция
};