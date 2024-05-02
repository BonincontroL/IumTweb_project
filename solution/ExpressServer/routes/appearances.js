/**
 * Express router to handle player appearances routes.
 * @module routes/appearances
 * @requires express
 * @requires ../controllers/appearances
 * @requires ./utils/utils
 */

var express = require('express');
var router = express.Router();

//=> Enable Cross-Origin Resource Sharing (CORS) middleware to allow cross-origin requests
const cors = require('cors');
router.use(cors());

const appearancesController = require("../controllers/appearances")  //=>Controller
const { isDataEmpty } = require('./utils/utils'); //=> Utility function


/**
 * Route to get the top scorer for a given competition.
 */
router.get('/getTopScorer', async (req,res)=>{
    const competitionId=req.query.comp_id;
    appearancesController.getTopScorer(competitionId)
        .then(data=>{
            if(!isDataEmpty(data)){
                res.status(200).json(data);
            }else{
                res.status(404).json({error: 'Nessun top scorer trovato'});
            }
        })
        .catch(err=>{
            console.error('Errore durante il recupero dei top scorer', err);
            res.status(500).json({ error: 'Errore durante il recupero dei top scorer' });
        });
})


/**
 * Route to get the statistics for a given player.
 */
router.get('/getPlayerStatistics/:playerId', async (req, res)=>{
       const idPlayer = req.params.playerId;
       appearancesController.getPlayerStatistics(idPlayer)
        .then(data=>{
           if(!isDataEmpty(data)){
               res.status(200).json(data);
           }else{
               res.status(204).json({error: 'Nessuna statistica trovata'});
           }
        })
        .catch(err=>{
            console.error('Errore durante il recupero delle statistiche del giocatore', err);
            res.status(500).json({ error: 'Errore durante il recupero delle statistiche del giocatore' });
        });
})


/**
 * Route to get the last games for a given player.
 */
router.get("/getPlayerGames/:playerId", async (req, res) => {
    const playerId = req.params.playerId;
    appearancesController.getPlayerGames(playerId)
        .then(data => {
            if (!isDataEmpty(data)) {
                res.status(200).json(data);
            } else {
                res.status(204).json({error: 'Nessuna partita trovata'});
            }
        })
        .catch(err => {
            console.error('Errore durante il recupero delle ultime partite del giocatore', err);
            res.status(500).json({error: 'Errore durante il recupero delle ultime partite del giocatore'});
        });
})





module.exports=router