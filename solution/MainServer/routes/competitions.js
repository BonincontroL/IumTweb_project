var express = require('express');
let axios = require('axios')
var router = express.Router();
const EXPRESS_SERVER = "http://localhost:3001"
const SPRING_SERVER = "http://localhost:8081"

const {handleAxiosError} = require('./utils/utils');

/**
 * Ritorna tutte le competizioni presenti nel database.
 */
router.get('/getAllCompetitions', function (req, res) {
    axios.get(SPRING_SERVER + "/competitions/getAllCompetitions")
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    });
})


router.get('/getCompetitionsGroupedByCountry', function (req, res) {
    axios.get(SPRING_SERVER + "/competitions/getCompetitionsGroupedByCountry")
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})

router.get('/getCompetitionsGroupedByCountryAndLikeName', function (req, res) {
    axios.get(SPRING_SERVER + "/competitions/getCompetitionsGroupedByCountryAndLikeName",
        {
            params: {
                name: req.query.name
            }
        })
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})
router.get('/getName', function (req, res) {
    axios.get(SPRING_SERVER + "/competitions/getName",
        {
            params: {
                competition_id: req.query.competition_id
            }
        })
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})
module.exports = router;

