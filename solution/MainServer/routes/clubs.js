var express = require('express');
let axios=require('axios')
var router = express.Router();
const SPRING_SERVER="http://localhost:8081"

router.get('/searchByCompetitionAndSeason', function (req,res){
    axios.get(SPRING_SERVER + "/clubs/searchByCompetitionAndSeason",{params:{
            competition_id: req.query.competition_id,
            season:req.query.season
        }
    })
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    });
})


/**
 * get al SpringServer per  tutte le squadre suddivise  per il carattere iniziale
 */
router.get('/getAllClubsByInitial', function (req, res) {
    axios.get(SPRING_SERVER+"/clubs/getAllClubsByInitial")
        .then(response => {
            res.send(response.data);
        }).catch(error => {
        res.status(500).send(error);
    });
});



module.exports= router

