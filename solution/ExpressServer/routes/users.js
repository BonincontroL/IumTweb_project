var express = require('express');
var router = express.Router();
const cors = require('cors');
router.use(cors());

const userController = require("../controllers/users.js")

/**
 * risponde al MainServer che gli manda i dati di  registrazione per  un nuovo utente se non esiste già.
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        const existingUser = await userController.findUserByUsername(username);
        console.log(existingUser); // da eliminare solo per test
        const existingEmail = await userController.findUserByEmail(email);
        console.log(existingEmail); // da eliminare solo per test
        if (existingUser) {
            return res.status(400).json({ message: 'Username già in uso' });
        }
        if(existingEmail){
            return res.status(400).json({ message: 'Email già in uso' });
        }
        await userController.createUser(username, email, password);
        res.status(200).json({ message: 'Registrazione completata con successo' });
    } catch (error) {
        console.log(req.body); // da eliminare solo per test
        console.error('Errore durante la registrazione:', error);
        res.status(500).json({ message: 'Errore durante la registrazione' });
    }
});


/**
 * Risponde al MainServer per autenticare un utente.
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
