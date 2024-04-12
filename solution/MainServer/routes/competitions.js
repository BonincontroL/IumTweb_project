var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"
const SPRING_SERVER="http://localhost:8081"

/**
 * Ritorna tutte le competizioni presenti nel database.
 */
router.get('/competitions/getAllCompetitions', function (req,res){
    axios.get(SPRING_SERVER+"/competitions/getAllCompetitions")
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    });
})




module.exports = router;

