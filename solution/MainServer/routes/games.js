var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001";
const SPRING_SERVER="http://localhost:8081";


router.get('/getLastMatchesByCompetition/:competitionId', function (req,res){
    axios.get(EXPRESS_SERVER+"/games/getLastMatchesByCompetition/"+req.params.competitionId)
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})

router.get('/getRoundNumbers', function (req,res){
    axios.get(EXPRESS_SERVER+"/games/getRoundNumbers",{
        params:{
            comp_id:req.query.comp_id,
            season:req.query.season
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        res.send(err)
    })
})
router.get('/getMatchesByCompAndSeasonAndRound', function (req,res){
    axios.get(EXPRESS_SERVER+"/games/getMatchesByCompAndSeasonAndRound",{
        params:{
            comp_id:req.query.comp_id,
            season:req.query.season,
            currentRound:req.query.currentRound
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        res.send(err)
    })
})
router.get('/getRefreeAndStadium', function (req,res){
    axios.get(EXPRESS_SERVER+"/games/getRefreeAndStadium",{
        params:{
            game_id:req.query.game_id
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        res.send(err)
    })
})
router.get('/getLastManager', function (req,res){
    axios.get(EXPRESS_SERVER+"/games/getLastManager",{
        params:{
            club_id:req.query.club_id
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        throw new Error(err)
    })
})
router.get('/getLast5GamesByClubId', function (req,res){
    axios.get(EXPRESS_SERVER+"/games/getLast5GamesByClubId",{
        params:{
            club_id:req.query.club_id
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        throw new Error(err)
    })
})
router.get('/getTableByCompSeasonAndType', function (req,res){
    axios.get(EXPRESS_SERVER+"/games/getTableByCompSeasonAndType",{
        params:{
            comp_id:req.query.comp_id,
            season:req.query.season,
            type:req.query.type
        }
    }).then(data=>{
        res.send(data.data)
    }).catch(err=>{
        throw new Error(err)
    })
})
module.exports = router;