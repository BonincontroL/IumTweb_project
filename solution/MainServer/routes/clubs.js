var express = require('express');
let axios = require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

const {handleAxiosError} = require('./utils/utils');
/**
 * Retrieves a list of clubs participating in a given competition for a specified season
 * @param competition_id the id of the competition
 * @param season
 */
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
/**
 * Retrieve last season for a specified club
 * @param club_id the id of the club
 * @returns map the last season for the specified club
 */
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
 * Retrieve all clubs grouped by their initial character
 * @returns  Map of clubs grouped by their initial character in a list.
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
 * Get clubs grouped by initial and name
 * @param name the name of the club or a string
 * @returns  Map of clubs grouped by their initial character in a list.
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
/**
 * Get clubs by ID
 * @param club_id the id of the club
 * @returns club with the specified id
 */
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

