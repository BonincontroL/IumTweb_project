var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());
const gameeventsController = require("../controllers/gameevents")
const { isDataEmpty } = require('./utils/utils');
router.get('/getTopScorer', async (req, res, next) => {
    const comp_id=req.query.comp_id;
    const season = +req.query.season;
    gameeventsController.getTopScorer(comp_id,season)
        .then(data=>{
            //res.status(200).json(data);
            if(!isDataEmpty(data)){
                res.status(200).json(data);
            }else{
                res.status(404).json({error: 'Nessun top scorer trovato'});
            }
        })
        .catch(err=>{
            console.error('Errore durante il recupero dei caponannonieri:', err);
            res.status(500).json({ error: 'Errore durante il recupero dei capocannonieri' });
        });
});

router.get('/getMatchEvents', async (req, res) => {
    const gameId=+req.query.game_id;
    gameeventsController.getMatchEvents(gameId)
        .then(data=>{
           // res.status(200).json(data);
            if(!isDataEmpty(data)){
                res.status(200).json(data);
            }else{
                res.status(404).json({error: 'Nessun match evento trovato'});
            }
        })
        .catch(err=>{
            console.error('Errore durante il recupero di tutti gli eventi:', err);
            res.status(500).json({ error: 'Errore durante il recupero di tutti gli eventi' });
        });
});
module.exports=router