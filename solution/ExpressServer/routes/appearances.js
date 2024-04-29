var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());
const appearancesController = require("../controllers/appearances")

const { isDataEmpty } = require('./utils/utils');

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

router.get("/getPlayerLast5Games/:playerId", async (req, res) => {
    const playerId = req.params.playerId;
    appearancesController.getPlayerLastGames(playerId)
        .then(data => {
            if (!isDataEmpty(data)) {
                res.status(200).json(data);
            } else {
                res.status(204).json({error: 'Nessuna partita trovata'});
            }
        })
        .catch(err => {
            console.error('Errore durante il recupero delle ultime 5 partite del giocatore', err);
            res.status(500).json({error: 'Errore durante il recupero delle ultime 5 partite del giocatore'});
        });
})





module.exports=router