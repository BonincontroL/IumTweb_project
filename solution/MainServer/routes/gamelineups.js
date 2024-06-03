var express = require('express');
let axios=require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');
const {handleAxiosError} = require('./utils/utils');

/**
 * Get player number by player id
 * @param {string} idPlayer
 * @return {object } player number an object with the following structure: {number: number}
 */
router.get('/getPlayerNumberByIdPlayer/:idPlayer', function (req,res){
    axios.get(EXPRESS_SERVER+"/gamelineups/getPlayerNumberByIdPlayer/"+req.params.idPlayer)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
/**
 * Retrieve players participating in a match
 * @param game_id the id of the game
 * @param home_club_id the id of the home club
 * @param away_club_id the id of the away club
 * @returns a list of players participating in a specific match
 */
router.get('/getMatchPlayers', function (req,res){
    axios.get(EXPRESS_SERVER+"/gamelineups/getMatchPlayers/", {params: {
            game_id: req.query.game_id,
            home_club_id: req.query.home_club_id,
            away_club_id: req.query.away_club_id
        }})
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})




module.exports = router;