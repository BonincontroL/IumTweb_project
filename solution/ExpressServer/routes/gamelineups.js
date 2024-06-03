/**
 * Express router to handle game lineup routes.
 * @module routes/gamelineups
 * @requires express
 * @requires ../controllers/gamelineups
 * @requires ./utils/utils
 */

var express = require('express');
var router = express.Router();

//=> Enable Cross-Origin Resource Sharing (CORS) middleware to allow cross-origin requests
const cors = require('cors');
router.use(cors());

const gamelineupsController = require("../controllers/gamelineups")//=> Controller
const { isDataEmpty } = require('./utils/utils');//=> Utility function


/**
 * Route to get the player number by player ID.
 */
router.get('/getPlayerNumberByIdPlayer/:player_id', async (req, res, next) => {
    const {player_id} = req.params;
    if(!player_id)
        return res.status(400).json({error:'Errore, manca ID del giocatore (player_id)'})
    gamelineupsController.getPlayerNumberByIdPlayer(player_id)
        .then(data => {
            if (!isDataEmpty(data)) {
                let playerNumber = data.number
                res.status(200).json({playerNumber});
            } else {
                res.status(204).json({});
            }
        })
        .catch(error => {
            console.error('Errore durante il recupero del numero del giocatore:', error);
            res.status(500).json({error: 'Errore durante il recupero del numero del giocatore'});
        })
});


/**
 * Route to get all players of a match.
 */
router.get('/getMatchPlayers', async (req, res) => {
    const game_id = +req.query.game_id
    const home_club_id = +req.query.home_club_id
    const away_club_id = +req.query.away_club_id
    if(!game_id || !home_club_id || !away_club_id)
        return res.status(400).json({error:'Errore, manca l\'ID della partita (game_id) oppure l\'ID della squadra in casa (home_club_id) oppure l\ID della squadra in trasferta (away_club_id)'})
    gamelineupsController.getMatchPlayers(game_id, home_club_id, away_club_id)
        .then(data => {
            if (!isDataEmpty(data)) {
                res.status(200).json(data);
            } else {
                res.status(204).json({});
            }
        })
        .catch(error => {
            console.error("Errore nel recupero delle lineup:" + error)
            res.status(500).json({error: error})
        })
})


module.exports = router;