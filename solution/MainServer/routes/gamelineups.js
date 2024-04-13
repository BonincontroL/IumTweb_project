var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001";
const SPRING_SERVER="http://localhost:8081";

/**
 * Get player number by player id
 */
router.get('/getPlayerNumberByIdPlayer/:idPlayer', function (req,res){
    axios.get(EXPRESS_SERVER+"/gamelineups/getPlayerNumberByIdPlayer/"+req.params.idPlayer)
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})

router.get('/getMatchPlayers', function (req,res){
    axios.get(EXPRESS_SERVER+"/gamelineups/getMatchPlayers/", {params: {
            game_id: req.query.game_id,
            home_club_id: req.query.home_club_id,
            away_club_id: req.query.away_club_id
        }})
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})




module.exports = router;