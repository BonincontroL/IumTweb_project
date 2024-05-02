const mongoose = require('mongoose');

/**
 * Mongoose schema for game events.
 * @module models/gameEvents
 * @requires mongoose
 */

const gameEventsSchema = new mongoose.Schema({
    game_event_id: { type: String, required: true },
    date: { type: Date, required: true },
    game_id: { type: Number, required: true },
    minute: { type: Number, required: true },
    type: { type: String, required: true },
    club_id: { type: Number, required: true },
    player_id: { type: Number, required: true },
    description: { type: String },
    player_assist_id: { type: Number },
    player_in_id: { type: Number }
});

/**
 * Exporting the model
 */
module.exports = mongoose.model('gameEvents', gameEventsSchema);