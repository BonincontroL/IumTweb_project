var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001";
const SPRING_SERVER="http://localhost:8081";

/**
 * Get player by competitionID
 */
router.get('/getPlayersByCompetition/:competition_id', function (req,res){
    axios.get(`http://localhost:8081/players/getPlayersByCompetition/${req.params.competition_id}`)
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})

router.get('/getPlayersByCompetitionOrderByLastSeason/:competition_id', function (req,res){
    axios.get(`http://localhost:8081/players/getPlayersByCompetition/${req.params.competition_id}`)
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})


router.get("/getPlayersImgUrlById", function (req,res){
    axios.get(SPRING_SERVER+"/players/getPlayersImgUrlById",{
        params:{
            starting:req.query.starting,
            substitutes:req.query.substitutes
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        res.send(err)
    })
})

module.exports = router;