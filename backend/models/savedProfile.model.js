const mongoose = require('mongoose');

const savedProfileSchema = new mongoose.Schema({
    target: { 
        type: String, 
        required: true 
    },
    profile: {
        name: String,
        bio: String,
        location: String,
        company: String,
        avatar_url: String
    },
    extracted_emails: [String],
    
    // Използваме Mixed за сложни/динамични обекти
    ai_profiling: mongoose.Schema.Types.Mixed,
    osint_extras: mongoose.Schema.Types.Mixed,
    repositories: mongoose.Schema.Types.Mixed,
    
    // Връзка към потребителя, който е запазил профила (твоят HR)
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