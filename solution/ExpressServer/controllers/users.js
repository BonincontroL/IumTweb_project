const bcrypt = require("bcrypt");
const User = require('../models/users');

/**
 * Creazione dell'utente e criptazione della password
 */

async function createUser(username, email, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({ username, email, password: hashedPassword });
            return newUser;
        } catch (error) {
            throw error;
        }

}

/**
 * funzione per trovare un utente tramite username per verificare l'esistenza nel db
 * @param username username dell'utente da trovare
 * @returns user l utente se esiste se no null
 */
async function findUserByUsername(username) {
    try {
        const user = await User.findOne({ username });
        return user;
    } catch (error) {
        throw error;
    }
}

/**
 * funzione per trovare un utente tramite email per verificare l'esistenza nel db
 * @param email email dell'utente da trovare
 * @returns user l'utente se esiste, null altrimenti
 */
async function findUserByEmail(email) {
    try {
        const user = await User.findOne({ email });
        return user;
    } catch (error) {
        throw error;
    }
}

module.exports = {
   createUser,
    findUserByUsername,
    findUserByEmail

};
