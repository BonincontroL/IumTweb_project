/**
 * Express router to handle game event routes.
 * @module routes/gameevents
 * @requires express
 * @requires ../controllers/gameevents
 * @requires ./utils/utils
 */

var express = require('express');
var router = express.Router();

//=> Enable Cross-Origin Resource Sharing (CORS) middleware to allow cross-origin requests
const cors = require('cors');
router.use(cors());

const gameeventsController = require("../controllers/gameevents") //=> Controller
const { isDataEmpty } = require('./utils/utils'); //=> Utility function


/**
 * Route to get the top scorer for a given competition and season.
 */
router.get('/getTopScorer', async (req, res, next) => {
    const comp_id=req.query.comp_id;
    const season = +req.query.season;
    gameeventsController.getTopScorer(comp_id,season)
        .then(data=>{
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


/**
 * Route to get all events for a given match.
 */
router.get('/getMatchEvents', async (req, res) => {
    const gameId=+req.query.game_id;
    gameeventsController.getMatchEvents(gameId)
        .then(data=>{
            if(!isDataEmpty(data)){
                res.status(200).json(data);
            }else{
                res.status(204).json({});
            }
        })
        .catch(err=>{
            console.error('Errore durante il recupero di tutti gli eventi:', err);
            res.status(500).json({ error: 'Errore durante il recupero di tutti gli eventi' });
        });
});
module.exports=router