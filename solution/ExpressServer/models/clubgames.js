const mongoose = require('mongoose');

const clubGameSchema = new mongoose.Schema({
    game_id: { type: Number, required: true },
    club_id: { type: Number, required: true },
    own_goals: { type: Number, required: true },
    own_manager_name: { type: String},
    own_position:{type: Number},
    opponent_id: { type: Number, required: true },
    opponent_goals: { type: Number, required: true },
    opponent_position :{ type: Number },
    opponent_manager_name: { type: String },
    hosting: { type: String, required: true, enum: ['Home', 'Away'] },
    is_win: { type: Number, required: true }
});

/**
 * Exporting the model
 */
module.exports = mongoose.model('clubGames', clubGameSchema);
