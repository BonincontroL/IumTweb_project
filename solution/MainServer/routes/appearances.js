var express = require('express');
let axios=require('axios')
var router = express.Router();


const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');
const { handleAxiosError } = require('./utils/utils');

/**
 * Returns player statistics including yellow cards, red cards, total goals, and total assists.
 */
router.get("/getPlayerStatistics/:playerId", function (req, res) {
    if (!req.params.playerId) {
        return res.status(400).json({error: 'Player ID is required'});
    }
    axios.get(EXPRESS_SERVER+'/appearances/getPlayerStatistics/'+req.params.playerId)
        .then(response => {
            res.status(response.status).send(response.data);
        })
        .catch(err => {
            handleAxiosError(err, res)
        });
});


/**
 *  Returns the games of a player.
 */
router.get("/getPlayerGames/:playerId", function (req, res) {
    if (!req.params.playerId) {
        return res.status(400).json({error: 400, message: 'Player ID is required'});
    }
    axios.get(EXPRESS_SERVER+'/appearances/getPlayerGames/'+req.params.playerId)
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
    if (!req.query.comp_id) {
        return res.status(400).json({error: 400, message: 'Competition ID is required'});
    }
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