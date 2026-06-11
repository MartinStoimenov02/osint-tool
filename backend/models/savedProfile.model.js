const mongoose = require('mongoose');

const savedProfileSchema = new mongoose.Schema({
    target: { // username
        type: String, 
        required: true 
    },
    profile: {
        name: String,
        bio: String, // описанието от профила, ако е попълнено
        location: String, // града от профила, ако е попълнен
        company: String, // текущия работодател, ако е попълнен
        avatar_url: String // URL към профилната му снимка
    },
    extracted_emails: [String],
    
    // Mixed - за сложни/динамични обекти
    ai_profiling: mongoose.Schema.Types.Mixed, // готовият анализ от изкуствения интелект
    osint_extras: mongoose.Schema.Types.Mixed, // допълнителни разузнавателни данни
    repositories: mongoose.Schema.Types.Mixed, // проектите на кандидата
    
    // Връзка към потребителя, който е запазил профила (HR)
    savedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    savedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Индекс за бързо търсене и предотвратяване на дубликати
savedProfileSchema.index({ target: 1, savedBy: 1 }, { unique: true });

module.exports = mongoose.model('SavedProfile', savedProfileSchema);