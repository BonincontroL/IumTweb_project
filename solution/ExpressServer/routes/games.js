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
        const round = req.query.round
        const finalTable = await GamesController.getTableByCompSeasonAndType(comp_id,season,type,round)
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
        res.status(500).json({error:error})
    }
})

router.get('/getRefreeAndStadium',async (req,res)=>{
    try{
        const game_id=+req.query.game_id
        const result = await GamesController.getRefreeStadiumAndManagers(game_id)
        res.status(200).json(result)
    }catch (error){
        res.status(500).json({error:error})
    }
})
router.get('/getLastManager',async (req,res)=>{
    try{
        const club_id = +req.query.club_id;
        const managerName= await GamesController.getLastManager(club_id)
        res.status(200).json(managerName)
    }catch (error){
        res.status(500).json({error:error})
    }
})
router.get('/getLast5GamesByClubId', async (req, res, next) => {
    const club_id = req.query.club_id;
    GamesController.getLast5GamesByClubId(club_id)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            console.error('Errore durante il recupero delle ultime 5 partite di un club:', error);
            res.status(500).json({error: 'Errore durante il recupero delle ultime 5 partite di un club'});
        })
});

/**
 * Restituisce i match per competitionId e season
 */
router.get('/getMatchesByCompetitionAndSeason/:competition_id/:season', async (req, res, next) => {
    const { competition_id, season } = req.params;
    try {
        const matches = await GamesController.getGamesByCompetitionIdAndSeason(competition_id,season);
        res.status(200).json(matches);
    } catch (error) {
        console.error('Errore durante il recupero dei match per season e competizione:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei match per season e competizione' });
    }
});
/**
 * this endpoint return all the competitions played by a certain club in a certain season
 */
router.get('/getCompetitionsByClubAndSeason', async (req, res) => {
    const club_id = +req.query.club_id
    const season = +req.query.season
    GamesController.getCompetitionsByClubAndSeason(club_id, season)
        .then(data => {
            data=data.map(result=>result._id)
            res.status(200).json(data);
        }).catch(err => {
        console.error('Errore durante il recupero delle competizioni giocate da un club in una season ', err);
        res.status(500).json({error: 'Errore durante il recupero delle competizioni giocate da un club in una season '})
    })
})
router.get('/getClubsDividedByGroups',async(req,res)=>{
    const competition_id = req.query.competition_id
    const season= +req.query.season
    GamesController.getClubsDividedByGroups(competition_id,season)
        .then(data=>{
            res.status(200).json(data)
        })
        .catch(err=>{
            console.error('Errore durante il recupero dei club nei gironi', err);
            res.status(500).json({error: 'Errore durante il recupero dei club nei gironi \n'+err})
        })
})

router.get('/getCompetitionIdsWithGroup',async (req,res)=>{
    GamesController.getCompetitionIdsWithGroup()
        .then(data=>{
            res.status(200).json(data)
        })
        .catch(err=>{
            console.error('Errore durante il recupero degli id delle competizioni con gruppi', err);
            res.status(500).json({error: 'Errore durante il recupero degli id delle competizioni con gruppi\n'+err})
        })
})
router.get('/getCompetitionSeasonsSorted', async(req,res)=>{
    GamesController.getCompetitionSeasonsSorted(req.query.competition_id)
        .then(data=>{
            res.status(200).json(data.map(item=>item.season))
        })
        .catch(err=>{
            console.error('Errore durante il recupero delle stagioni di una competizione', err);
            res.status(500).json({error: 'Errore durante il recupero delle stagioni di una competizione\n'+err})
        })
})
module.exports = router;