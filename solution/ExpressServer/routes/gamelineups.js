var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());


const gamelineupsController = require("../controllers/gamelineups")



/**
 * GET http://localhost:3001/gamelineups/getPlayerNumberByIdPlayer/:idPlayer
 *
 * Restituisce il numero del giocatore dato l'ID del giocatore
 */
router.get('/getPlayerNumberByIdPlayer/:idPlayer', async (req, res, next) => {
    try {
        const { idPlayer } = req.params;
        const playerNumber = await gamelineupsController.getPlayerNumberByIdPlayer(idPlayer);
        res.status(200).json({ playerNumber });
    } catch (error) {
        console.error('Errore durante il recupero del numero del giocatore:', error);
        res.status(500).json({ error: 'Errore durante il recupero del numero del giocatore' });
    }
});



module.exports = router;