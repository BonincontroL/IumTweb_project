var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());
const gameeventsController = require("../controllers/gameevents")

router.get('/getTopScorer', async (req, res, next) => {
    const comp_id=req.query.comp_id;
    const season = +req.query.season;
    gameeventsController.getTopScorer(comp_id,season)
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err=>{
            console.error('Errore durante il recupero dei caponannonieri:', err);
            res.status(500).json({ error: 'Errore durante il recupero dei capocannonieri' });
        });
});

router.get('/getMatchEvents', async (req, res) => {
    const gameId=+req.query.game_id;
    const homeClubId=+req.query.home_club_id;
    const awayClubId=+req.query.away_club_id;

    gameeventsController.getMatchEvents(gameId,homeClubId,awayClubId)
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err=>{
            console.error('Errore durante il recupero di tutti gli eventi:', err);
            res.status(500).json({ error: 'Errore durante il recupero di tutti gli eventi' });
        });
});
module.exports=router