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





module.exports = router;