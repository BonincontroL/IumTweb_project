var express = require('express');
let axios = require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

const {handleAxiosError} = require('./utils/utils');

router.get('/getByCompetitionAndSeason', function (req, res) {
    axios.get(SPRING_SERVER + "/clubs/getByCompetitionAndSeason", {
        params: {
            competition_id: req.query.competition_id,
            season: req.query.season
        }
    })
        .then(data => {
            res.status(data.status).send(data.data)
        }).catch(err => {
        handleAxiosError(err, res)
    });
})
router.get('/getLastSeason', function (req, res) {
    axios.get(SPRING_SERVER + "/clubs/getLastSeason", {
        params: {
            club_id: +req.query.club_id,
        }
    }).then(data => {
        res.status(data.status).send(data.data)
    }).catch(err => {
        handleAxiosError(err, res)
    });
})

/**
 * get al SpringServer per tutte le squadre suddivise per il carattere iniziale
 */
router.get('/getAllClubsByInitial', function (req, res) {
    axios.get(SPRING_SERVER + "/clubs/getAllClubsByInitial")
        .then(response => {
            if (response.status === 200) {
                res.send(response.data);
            } else {
                res.status(response.status).send(response.data);
            }
        }).catch(err => {
        handleAxiosError(err, res)
    });
});

/**
 * get al SpringServer per tutte le squadre suddivise per il carattere iniziale e il nome che si digita nella barra di ricerca
 */
router.get('/getClubsGroupedByInitialAndLikeName', function (req, res) {
    // Utilizzo del parametro "name" direttamente dall'URL
    axios.get(SPRING_SERVER+`/clubs/getClubsGroupedByInitialAndLikeName`, {
        params: {
            name: req.query.name,
        }
    })
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})
router.get('/get', function (req, res) {
    // Utilizzo del parametro "name" direttamente dall'URL
    axios.get(SPRING_SERVER+`/clubs/get`,{
        params:{
            club_id:req.query.club_id
        }
    })
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})



module.exports = router

