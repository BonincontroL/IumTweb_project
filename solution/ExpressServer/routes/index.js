var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());

/**
 * Importa il controller per i games
 */
const GamesController = require("../controllers/games")


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/**
 * Route per ottenere tutti i games -- TEST
 */
router.get('/games/getAllGames', async (req, res, next) => {
  try {
    const matches = await GamesController.getAllGames();
    res.status(200).json(matches);
  } catch (error) {
    console.error('Errore durante il recupero dei matches:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei matches' });
  }
});

module.exports = router;
