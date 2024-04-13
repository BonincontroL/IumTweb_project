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

router.get('/getLastMatchesByCompetition/:competition_id', async (req, res, next) => {
    try{
        const {competition_id} = req.params;
        const lastMatches = await GamesController.getLast5Games(competition_id);
        res.status(200).json(lastMatches);
    } catch (error) {
        console.error('Errore durante il recupero delle ultime partite:', error);
        res.status(500).json({ error: 'Errore durante il recupero delle ultime partite' });
    }
});

/**
 * serve per prendere i numeri delle giornate di un campionato in una certa stagione.
 */
router.get('/getRoundNumbers',async (req,res)=>{
    try{
        const comp_id = req.query.comp_id;
        const season = +req.query.season;
        const lastRounds = await GamesController.getRoundNumbers(comp_id,season)
        res.status(200).json(lastRounds)
    }catch (error){
        console.error('Errore durante il recupero delle giornate della competizione'+req.query.comp_id+' durante la stagione '+req.query.season)
        res.status(500).json({error:error})
    }
})

router.get('/getTableByCompSeasonAndType', async (req,res)=>{
    try{
        const comp_id = req.query.comp_id
        const season = +req.query.season
        const type = req.query.type
        const finalTable = await GamesController.getTableByCompSeasonAndType(comp_id,season,type)
        res.status(200).json(finalTable)
    }catch (error){
        res.status(500).json({error:error})
    }
})

router.get('/getMatchesByCompAndSeasonAndRound', async(req,res)=>{
    try{
        const comp_id=req.query.comp_id
        const season=+req.query.season;
        const round = req.query.currentRound
        const matches = await GamesController.getMatchesByCompAndSeasonAndRound(comp_id,season,round)
        res.status(200).json(matches)
    }catch (error){
        res.status(200).json({error:error})
    }
})

router.get('/getRefreeAndStadium',async (req,res)=>{
    try{
        const game_id=+req.query.game_id
        const result = await GamesController.getRefreeAndStadium(game_id)
        res.status(200).json(result)
    }catch (error){
        res.status(200).json({error:error})
    }
})
module.exports = router;