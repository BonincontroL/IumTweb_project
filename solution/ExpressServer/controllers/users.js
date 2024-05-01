const bcrypt = require("bcrypt");
const User = require('../models/users');


/**
 * Creates a new user and encrypts the password.
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<Object>} - A promise that resolves to the newly created user.
 * @throws Will throw an error if there is an issue creating the user.
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
 * Finds a user by username to check existence in the database.
 * @param {string} username - The username of the user to find.
 * @returns {Promise<Object|null>} - A promise that resolves to the user if found, otherwise null.
 * @throws Will throw an error if there is an issue finding the user.
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
 * Finds a user by email to check existence in the database.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<Object|null>} - A promise that resolves to the user if found, otherwise null.
 * @throws Will throw an error if there is an issue finding the user.
 */
async function findUserByEmail(email) {
    try {
        const user = await User.findOne({ email });
        return user;
    } catch (error) {
        throw error;
    }
}

/**
 * Authenticates a user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<Object>} - A promise that resolves to an object representing the authentication result.
 */
function authenticateUser(email, password) {
    return new Promise((resolve, reject) => {
        User.findOne({ email })
            .then(user => {
                if (!user) {
                    resolve({ success: false, message: 'Utente non trovato' });
                } else {
                    bcrypt.compare(password, user.password)
                        .then(isValidPassword => {
                            if (isValidPassword) {
                                resolve({ success: true, user });
                            } else {
                                resolve({ success: false, message: 'Password non corretta' });
                            }
                        })
                        .catch(error => {
                            console.error('Errore durante il confronto della password:', error);
                            reject(error);
                        });
                }
            })
            .catch(error => {
                console.error('Errore durante la ricerca dell\'utente:', error);
                reject(error);
            });
    });
}

module.exports = {
   createUser,
    findUserByUsername,
    findUserByEmail,
    authenticateUser

};
