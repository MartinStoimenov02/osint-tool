const SavedProfile = require('../models/savedProfile.model');

const saveProfile = async (req, res) => {
    try {
        // Взима се ID-то на логнатия потребител от токена (през authMiddleware)
        const userId = req.user.id || req.user._id; 
        const profileData = req.body;

        if (!profileData || !profileData.target) {
            // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
            return res.status(400).json({ success: false, error: "MISSING_PROFILE_DATA" });
        }

        // Проверка дали HR-ът вече е запазил този кандидат
        const existingProfile = await SavedProfile.findOne({ 
            target: profileData.target, 
            savedBy: userId 
        });

        if (existingProfile) {
            // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
            return res.status(409).json({ 
                success: false, 
                error: "PROFILE_ALREADY_SAVED" 
            });
        }

        // Създаване на записа
        const newSavedProfile = new SavedProfile({
            target: profileData.target, // username 
            profile: profileData.profile,
            extracted_emails: profileData.extracted_emails,
            ai_profiling: profileData.ai_profiling,
            osint_extras: profileData.osint_extras,
            repositories: profileData.repositories,
            savedBy: userId
        });

        await newSavedProfile.save();

        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(201).json({ 
            success: true, 
            message: "PROFILE_SAVED_SUCCESSFULLY" 
        });

    } catch (err) {
        console.error("Грешка при запазване на профил:", err);
        // Хващане на Duplicate Key грешка от MongoDB (код 11000)
        if (err.code === 11000) {
            // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
            return res.status(409).json({ success: false, error: "PROFILE_ALREADY_SAVED" });
        }
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ success: false, error: "SERVER_ERROR_SAVING" });
    }
};

// Извличане на всички запазени профили за текущия потребител
const getSavedProfiles = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        
        // Намиране на всички профили, запазени от този HR, и сортиране от най-новите към най-старите
        const profiles = await SavedProfile.find({ savedBy: userId }).sort({ savedAt: -1 });
        
        res.status(200).json({ success: true, profiles });
    } catch (err) {
        console.error("Грешка при извличане на профили:", err);
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ success: false, error: "SERVER_ERROR_FETCHING" });
    }
};

// Изтриване на запазен профил
const deleteSavedProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { target } = req.params; // username-а от URL-а

        // проверка, че се трие само профил, запазен от този потребител
        const deletedProfile = await SavedProfile.findOneAndDelete({ target: target, savedBy: userId });

        if (!deletedProfile) {
            // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
            return res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
        }

        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(200).json({ success: true, message: "PROFILE_DELETED_SUCCESSFULLY" });
    } catch (err) {
        console.error("Грешка при изтриване на профил:", err);
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ success: false, error: "SERVER_ERROR_DELETING" });
    }
};

module.exports = {
    saveProfile,
    getSavedProfiles,
    deleteSavedProfile
};