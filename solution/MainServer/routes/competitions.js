var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"
const SPRING_SERVER="http://localhost:8081"

/**
 * Ritorna tutte le competizioni presenti nel database.
 */
router.get('/getAllCompetitions', function (req,res){
    axios.get(SPRING_SERVER+"/competitions/getAllCompetitions")
        .then(data=>{
            if (data.status === 200) {
                res.send(data.data);
            }else{
                res.status(data.status).send(data.data);
            }
        }).catch(err=>{
        res.status(err.status).send(err)
    });
})


router.get('/getCompetitionsGroupedByCountry', function (req,res){
    axios.get(SPRING_SERVER+"/competitions/getCompetitionsGroupedByCountry")
        .then(data=>{
            if (data.status === 200) {
                res.send(data.data);
            }else{
                res.status(data.status).send(data.data);
            }
        }).catch(err=>{
        res.status(err.status).send(err)
    })
})

router.get('/getCompetitionsGroupedByCountryAndLikeName', function (req,res){
    axios.get(SPRING_SERVER+"/competitions/getCompetitionsGroupedByCountryAndLikeName",
        {params:{
                name:req.query.name
            }})
        .then(data=>{
            if (data.status === 200) {
                res.send(data.data);
            }else{
                res.status(data.status).send(data.data);
            }
        }).catch(err=>{
        res.status(err.status).send(err)
    })
})
router.get('/getName', function (req,res){
    axios.get(SPRING_SERVER+"/competitions/getName",
        {params:{
                competition_id:req.query.competition_id
            }})
        .then(data=>{
            if (data.status === 200) {
                res.send(data.data);
            }else{
                res.status(data.status).send(data.data);
            }
        }).catch(err=>{
        res.status(err.status).send(err)
    })
})
module.exports = router;

