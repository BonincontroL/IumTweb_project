var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"
const SPRING_SERVER="http://localhost:8081"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('landing_page.html');
});

router.get('/getCompetitionInformation', function (req,res){
  axios.get(SPRING_SERVER+"/competitions/get",{params:{
        competition_id:req.query.competition_id
        }
    })
      .then(data=>{
        res.send(data.data)
      })
      .catch(err=>{
        res.send(err)
      })
})
router.get('/competitions/getCompetitionsGroupedByCountry', function (req,res){
    axios.get(SPRING_SERVER+"/competitions/getCompetitionsGroupedByCountry")
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
            res.send(err)
    })
})
router.get('/competitions/getCompetitionsGroupedByCountryAndLikeName', function (req,res){
    axios.get(SPRING_SERVER+"/competitions/getCompetitionsGroupedByCountryAndLikeName",
        {params:{
        name:req.query.name
        }})
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})

router.get('/games/getRoundNumbers', function (req,res){
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
