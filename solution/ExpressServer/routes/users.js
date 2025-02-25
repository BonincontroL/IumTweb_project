/**
 * Express router to handle user authentication and registration routes.
 * @module routes/users
 * @requires express
 * @requires ../controllers/users
 * @requires ./utils/utils
 */

var express = require('express');
var router = express.Router();

//=> Enable Cross-Origin Resource Sharing (CORS) middleware to allow cross-origin requests
const cors = require('cors');
router.use(cors());

const { isDataEmpty } = require('./utils/utils');//=> Utility function
const userController = require("../controllers/users.js")//=> Controller

/**
 * Route to register a new user.
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        const existingUser = await userController.findUserByUsername(username);

        const existingEmail = await userController.findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: 'Username già in uso' });
        }
        if(existingEmail){
            return res.status(400).json({ message: 'Email già in uso' });
        }
        await userController.createUser(username, email, password);
        res.status(200).json({ message: 'Registrazione completata con successo' });
    } catch (error) {

        console.error('Errore durante la registrazione:', error);
        res.status(500).json({ message: 'Errore durante la registrazione' });
    }
});


/**
 * Route to authenticate a user.
 */
router.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const authenticationResult = await userController.authenticateUser(email, password);

        if (authenticationResult.success) {
            const user = authenticationResult.user;
            res.status(200).json({ success: true, username: user.username });
        } else {
            res.status(401).json({ success: false, message: authenticationResult.message });
        }
    } catch (error) {
        console.error('Errore durante l\'autenticazione:', error);
        res.status(500).json({ success: false, message: 'Errore durante l\'autenticazione' });
    }
});







module.exports = router;
