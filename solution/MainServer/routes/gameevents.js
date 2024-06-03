var express = require('express');
let axios=require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

module.exports=router

const {handleAxiosError} = require('./utils/utils');
/**
 * Retrieve match events by game ID
 * @param game_id the id of the game
 * @returns list of match events of a game
 */
router.get('/getMatchEvents', function (req,res){
    if (!req.query.game_id) {
        return res.status(400).json({ error: 400, message: 'Game ID is required' });
    }
    axios.get(EXPRESS_SERVER+"/gameevents/getMatchEvents",
        {params:{
                game_id:req.query.game_id
            }})
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
