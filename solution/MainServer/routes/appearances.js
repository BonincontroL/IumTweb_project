var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"
const SPRING_SERVER="http://localhost:8081"

const { handleAxiosError } = require('./utils/utils');

/**
 * ritorna le statistiche del giocatore (cartellini gialli, rossi, goal e assist totali).
 */
router.get("/getPlayerStatistics/:playerId", function (req, res) {
    axios.get(EXPRESS_SERVER+'/appearances/getPlayerStatistics/'+req.params.playerId)
        .then(response => {
            if (response.status === 200) {
                res.send(response.data);
            }else{
                res.status(response.status).send(response.data);
            }
        })
        .catch(err => {
            console.error('Errore durante il recupero delle statistiche del giocatore', err);
            handleAxiosError(err,res)
        });
});



module.exports = router;