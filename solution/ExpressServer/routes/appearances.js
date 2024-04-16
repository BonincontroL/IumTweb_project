var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());
const appearancesController = require("../controllers/appearances")

router.get('/getTopScorer', async (req,res)=>{
    const competitionId=req.query.comp_id;
    appearancesController.getTopScorer(competitionId)
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err=>{
            console.error('Errore durante il recupero dei top scorer', err);
            res.status(500).json({ error: 'Errore durante il recupero dei top scorer' });
        });
})
module.exports=router