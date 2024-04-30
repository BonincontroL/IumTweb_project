var express = require('express');
let axios=require('axios')
var router = express.Router();


const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');
const { handleAxiosError } = require('./utils/utils');

/**
 * Returns player statistics including yellow cards, red cards, total goals, and total assists.
 */
router.get("/getPlayerStatistics/:playerId", function (req, res) {
    axios.get(EXPRESS_SERVER+'/appearances/getPlayerStatistics/'+req.params.playerId)
        .then(response => {
            res.status(response.status).send(response.data);
        })
        .catch(err => {
            handleAxiosError(err, res)
        });
});


/**
 *  Returns the last 5 games of a player.
 */
router.get("/getPlayerLast5Games/:playerId", function (req, res) {
    axios.get(EXPRESS_SERVER+'/appearances/getPlayerLast5Games/'+req.params.playerId)
        .then(response => {
            res.status(response.status).send(response.data);
        })
        .catch(err => {
            handleAxiosError(err, res)
        });
});

/**
 * Returns the top scorer of a competition.
 */
router.get("/getTopScorer", function (req, res) {
    axios.get(EXPRESS_SERVER + '/appearances/getTopScorer', {
        params: {
            comp_id: req.query.comp_id
        }
    }).then(response => {
        res.status(response.status).send(response.data);
    }).catch(err => {
        handleAxiosError(err, res)
    });
});



module.exports = router;