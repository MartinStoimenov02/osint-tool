const mongoose = require('mongoose');

const UserScheme = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required."],
    },
    email: {
        type: String,
        required: [true, "email is required."],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleAuth; // Required only for non-Google users
        },
        minlength: [8, "Your password must be 8 characters or longer."],
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true, 
        set: function (val) {
            return val && val.trim() !== "" ? val : undefined;  
        },
    },
    firstLogin: {
        type: Boolean,
        default: true
    },
    isGoogleAuth: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String, // тайната за Google Authenticator
    },
    twoFactorRecoveryCodes: {
        type: [String], // Масив с бекъп кодове
    },
    // --- НОВО: Поле за одобрение от администратор ---
    isAccepted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const UserModel = mongoose.model("user", UserScheme);

module.exports = UserModel;