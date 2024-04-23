var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());


const gamelineupsController = require("../controllers/gamelineups")
const { isDataEmpty } = require('./utils/utils');


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

/**
 * route che restituisce tutti i giocatori di una partita
 * i parametri nella query sono
 * -game_id: identificativo della partita
 * -home_club_id: identificativo della squadra in casa
 * -away_club_id: identificativo della squadra in trasferta
 */
router.get('/getMatchPlayers', async(req,res)=>{
    try{
        const game_id= +req.query.game_id
        const home_club_id = +req.query.home_club_id
        const away_club_id = +req.query.away_club_id
        const allPlayers = await gamelineupsController.getMatchPlayers(game_id,home_club_id,away_club_id)
        res.status(200).json(allPlayers)
    }catch (error){
        res.status(500).json({error:error})
    }
})


module.exports = router;