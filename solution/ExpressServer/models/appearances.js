const mongoose = require('mongoose');

const appearanceSchema = new mongoose.Schema({
    appearance_id: { type: String, required: true, unique: true },
    game_id: { type: Number, required: true },
    player_id: { type: Number, required: true },
    player_club_id: { type: Number, required: true },
    player_current_club_id: { type: Number, required: true },
    date: { type: Date, required: true },
    player_name: { type: String, required: true },
    competition_id: { type: String, required: true },
    yellow_cards: { type: Number, required: true, default: 0 },
    red_cards: { type: Number, required: true, default: 0 },
    goals: { type: Number, required: true, default: 0 },
    assists: { type: Number, required: true, default: 0 },
    minutes_played: { type: Number, required: true }
});

/**
 * Exporting the model
 */
module.exports = mongoose.model('appearances', appearanceSchema);
