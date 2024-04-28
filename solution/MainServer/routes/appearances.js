var express = require('express');
let axios=require('axios')
var router = express.Router();


const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');
const { handleAxiosError } = require('./utils/utils');

/**
 * ritorna le statistiche del giocatore (cartellini gialli, rossi, goal e assist totali).
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

router.get("/getPlayerLast5Games/:playerId", function (req, res) {
    axios.get(EXPRESS_SERVER+'/appearances/getPlayerLast5Games/'+req.params.playerId)
        .then(response => {
            res.status(response.status).send(response.data);
        })
        .catch(err => {
            handleAxiosError(err, res)
        });
});

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