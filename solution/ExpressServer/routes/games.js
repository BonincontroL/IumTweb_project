/**
 * Express router to handle game routes.
 * @module routes/games
 * @requires express
 * @requires ../controllers/games
 * @requires ./utils/utils
 */

var express = require('express');
var router = express.Router();

//=> Enable Cross-Origin Resource Sharing (CORS) middleware to allow cross-origin requests
const cors = require('cors');
router.use(cors());

const GamesController = require("../controllers/games")//=> Controller

/**
 * Route to get last matches by competition ID.
 */
router.get('/getLastMatchesByCompetition/:competition_id', async (req, res, next) => {
    try{
        const {competition_id} = req.params;
        if(!competition_id)
            return res.status(400).json({error:'Errore, manca ID della competizione (comp_id)'})
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
    const comp_id = req.query.comp_id;
    const season = +req.query.season;
    if(!comp_id || !season)
        return res.status(400).json({error:'Errore, manca ID della competizione (comp_id) o stagione (season)'})
    GamesController.getRoundNumbers(comp_id, season)
        .then(lastRounds => {
            let groupRounds = lastRounds[0].groupRounds.map(item => item.round);
            let otherRounds = lastRounds[0].otherRounds.map(item => item.round)
            res.status(200).json({groupRounds: groupRounds, otherRounds: otherRounds})
        })
        .catch(err => {
            console.error('Errore durante il recupero delle giornate della competizione ' + req.query.comp_id + ' durante la stagione ' + req.query.season)
            res.status(500).json({error: err})
        })
})

router.get('/getTableByCompSeasonAndType', (req,res)=>{
    const comp_id = req.query.comp_id
    const season = +req.query.season
    const type = req.query.type
    const round = req.query.round
    if(!comp_id || !season || !type) //round could be optional
        return res.status(400).json({error:'Errore, manca ID della competizione (comp_id) o stagione (season) o tipologia classifica (type)'})
    GamesController.getTableByCompSeasonAndType(comp_id, season, type, round)
        .then(finalTable => {
            res.status(200).json(finalTable)
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
})

router.get('/getMatchesByCompAndSeasonAndRound',  (req, res) => {
    const comp_id = req.query.comp_id
    const season = +req.query.season;
    const round = req.query.currentRound;
    if(!comp_id || !season) // round could be optional
        return res.status(400).json({error:'Errore, manca ID della competizione (comp_id) o stagione (season)'})
    GamesController.getMatchesByCompAndSeasonAndRound(comp_id, season, round)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            console.error('Errore durante il recupero dei match per season, competizione e round:', err);
            res.status(500).json({error: 'Errore durante il recupero dei match per season, competizione e round: ' + err})
        })
})

router.get('/get', (req,res)=>{
    const game_id = +req.query.game_id
    if(!game_id)
        return res.status(400).json({error:'Errore, manca ID della partita (game_id)'})
    GamesController.get(game_id)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json({error: err})

        })
})
router.get('/getLastManager', (req, res) => {
    const club_id = +req.query.club_id;
    if(!club_id)
        return res.status(400).json({error:'Errore, manca ID del club (club_id)'})
    GamesController.getLastManager(club_id)
        .then(managerName => {
            res.status(200).json(managerName)
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
})

/**
 * this endpoint return all the competitions played by a certain club in a certain season
 */
router.get('/getCompetitionsByClubAndSeason',  (req, res) => {
    const club_id = +req.query.club_id
    const season = +req.query.season
    if(!club_id || !season)
        return res.status(400).json({error:'Errore, manca ID del club (club_id) o stagione (season)'})
    GamesController.getCompetitionsByClubAndSeason(club_id, season)
        .then(data => {
            data=data.map(result=>result._id)
            res.status(200).json(data);
        })
        .catch(err => {
            console.error('Errore durante il recupero delle competizioni giocate da un club in una season ', err);
            res.status(500).json({error: 'Errore durante il recupero delle competizioni giocate da un club in una season '})
        })
})
router.get('/getClubsDividedByGroups',(req,res)=>{
    const competition_id = req.query.competition_id
    const season= +req.query.season
    if(!competition_id || !season)
        return res.status(400).json({error:'Errore, manca ID della competizione(competition_id) o stagione (season)'})
    GamesController.getClubsDividedByGroups(competition_id,season)
        .then(data=>{
            res.status(200).json(data)
        })
        .catch(err=>{
            console.error('Errore durante il recupero dei club nei gironi', err);
            res.status(500).json({error: 'Errore durante il recupero dei club nei gironi \n'+err})
        })
})

router.get('/getCompetitionIdsWithGroup', (req,res)=>{
    GamesController.getCompetitionIdsWithGroup()
        .then(data=>{
            res.status(200).json(data)
        })
        .catch(err=>{
            console.error('Errore durante il recupero degli id delle competizioni con gruppi', err);
            res.status(500).json({error: 'Errore durante il recupero degli id delle competizioni con gruppi\n'+err})
        })
})
router.get('/getCompetitionSeasonsSorted', (req,res)=>{
    if(!req.query.competition_id)
        return res.status(400).json({error:'Errore, manca ID della competizione (competition_id'})
    GamesController.getCompetitionSeasonsSorted(req.query.competition_id)
        .then(data=>{
            res.status(200).json(data.map(item=>item.season))
        })
        .catch(err=>{
            console.error('Errore durante il recupero delle stagioni di una competizione', err);
            res.status(500).json({error: 'Errore durante il recupero delle stagioni di una competizione\n'+err})
        })
})

/**
 * Retrive last matches played by club in a certain season
 * result could be limited
 */
router.get('/getLastGamesByClubIdandSeason', async (req, res, next) => {
    const club_id = req.query.club_id;
    const season = req.query.season;
    const limit = req.query.limit

    if (!club_id || !season)  //limit could be optional
        return res.status(400).json({ error: 'Manca l\'ID del club(club_id) o la stagione (season)' });
    try {
        const data = await GamesController.getLastGamesByClubIdandSeason(club_id, season,limit);
        res.status(200).json(data);
    } catch (error) {
        console.error('Errore durante il recupero delle  partite di un club per una stagione specifica:', error);
        res.status(500).json({ error: 'Errore durante il recupero delle ultime partite di un club per una stagione specifica' });
    }
});


/**
 * retrive all the season when club played at least one game.
 */
router.get('/getSeasonsByClubId',  (req, res, next) => {
    const club_id =+req.query.club_id;
    if(!club_id)
        return res.status(400).json({ error: 'Manca l\'ID del club (club_id)' });
    GamesController.getSeasonsByClubId(club_id)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            console.error('Errore durante il recupero delle stagioni del Club:', error);
            res.status(500).json({error: 'Errore durante il recupero delle stagioni'});
        })
});
/**
 * given home club id and away club id, retrives the number of win of the home club,
 * the number of draws and the number of win of the away club
 */
router.get('/getHeadToHead',  (req, res) => {
    const homeClubId=+req.query.homeClubId;
    const awayClubId=+req.query.awayClubId;
    if(!homeClubId || !awayClubId)
        return res.status(400).json({ error: 'Manca l\'ID del club in casa (homeClubId) o l\'ID del club in trasferta (awayClubId)' });
    GamesController.getHeadToHead(homeClubId,awayClubId)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            console.error('Errore durante il recupero degli head to head', error);
            res.status(500).json({error: 'Errore durante il recupero degli head to head'});
        })
});


module.exports = router;