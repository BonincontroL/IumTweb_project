var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"
const SPRING_SERVER="http://localhost:8081"



/**
 * ritorna le statistiche del giocatore (cartellini gialli, rossi, goal e assist totali).
 */
router.get("/getPlayerStatistics/:playerId", function (req, res) {
    axios.get(EXPRESS_SERVER+'/appearances/getPlayerStatistics/'+req.params.playerId)
        .then(response => {
            console.log(`Data received: ${JSON.stringify(response.data)}`);
            res.status(200).send(response.data);
        })
        .catch(err => {
            console.error('Errore durante il recupero delle statistiche del giocatore', err);
            res.status(500).send('Errore durante il recupero delle statistiche del giocatore');
        });
});



module.exports = router;