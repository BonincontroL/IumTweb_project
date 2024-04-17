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

router.get('/getPlayersByCompetitionAndLastSeason/:competition_id/:last_season', function (req,res){
    axios.get(`http://localhost:8081/players/getPlayersByCompetitionAndLastSeason/${req.params.competition_id}/${req.params.last_season}`)
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
router.get("/searchByClubIdAndSeason", function (req,res){
    axios.get(SPRING_SERVER+"/players/searchByClubIdAndSeason",{
        params:{
            club_id:req.query.club_id,
            season:req.query.season
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        res.send(err)
    })
})
module.exports = router;