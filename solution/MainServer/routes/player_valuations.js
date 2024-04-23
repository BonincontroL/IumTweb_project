var express = require('express');
let axios=require('axios')
var router = express.Router();


const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');
const { handleAxiosError } = require('./utils/utils');

/**
 * Get player valuation by player id per year
 * @param {string} idPlayer
 * @return {object } player valuation an array of objects with the following structure: [[year: string, market_value media: number]]
 */
router.get('/getPlayerValuationPerYear/:idPlayer', function (req,res){
    axios.get(SPRING_SERVER+"/player_valuations/getMarketValuePerYear/"+req.params.idPlayer)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})





module.exports = router;