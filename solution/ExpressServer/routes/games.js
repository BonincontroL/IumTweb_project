var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());

/**
 * Importa il controller per i games
 */
const GamesController = require("../controllers/games")

/**
 * GET http://localhost:3001/games/getAllGames
 *
 * GET /getAllGames  - Restituisce tutti i games
 */
router.get('/getAllGames', async (req, res, next) => {
    try {
        const AllGames = await GamesController.getAllGames();
        res.status(200).json(AllGames);
    } catch (error) {
        console.error('Errore durante il recupero dei Games:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei Games' });
    }
});

module.exports = router;