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
            res.status(500).json({ error: 'Errore durante il recupero del numero del giocatore' });
        });
});

module.exports=router