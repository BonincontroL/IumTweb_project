const mongoose = require('mongoose');

/**
 * Mongoose schema for users.
 * @module models/users
 * @requires mongoose
 */

const usersSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});


/**
 * Exporting the model
 */
module.exports =  mongoose.model('User', usersSchema);