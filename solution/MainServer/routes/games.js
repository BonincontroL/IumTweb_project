var express = require('express');
let axios = require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');


const {handleAxiosError} = require('./utils/utils');
/**
 * Get last matches (games) by competition id
 */
router.get('/getLastMatchesByCompetition/:competitionId', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getLastMatchesByCompetition/" + req.params.competitionId)
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})

/**
 * get round numbers by competition id and season
 */

router.get('/getRoundNumbers', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getRoundNumbers", {
        params: {
            comp_id: req.query.comp_id,
            season: req.query.season
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})

/**
 * get matches(games) by competition id, season and round

 */
router.get('/getMatchesByCompAndSeasonAndRound', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getMatchesByCompAndSeasonAndRound", {
        params: {
            comp_id: req.query.comp_id,
            season: req.query.season,
            currentRound: req.query.currentRound
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})
router.get('/getRefreeAndStadium', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getRefreeAndStadium", {
        params: {
            game_id: req.query.game_id
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})

/**
 * Get last manager by club id
 */
router.get('/getLastManager', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getLastManager", {
        params: {
            club_id: req.query.club_id
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        //throw new Error(err)
        handleAxiosError(err, res)
    })
})
/**
 * Get last 5 games by club id
 */
router.get('/getLast5GamesByClubId', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getLast5GamesByClubId", {
        params: {
            club_id: req.query.club_id
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        //throw new Error(err)
        handleAxiosError(err, res)
    })
})
router.get('/getTableByCompSeasonAndType', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getTableByCompSeasonAndType", {
        params: {
            comp_id: req.query.comp_id,
            season: req.query.season,
            type: req.query.type,
            round: req.query.round
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})

/**
 * return a list of competition ids which are all
 * the competitions that have a division in Group (Group A, Group B...)
 */
router.get('/getCompetitionIdsWithGroup', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getCompetitionIdsWithGroup",)
        .then(data => {
            res.send(data.data)
        }).catch(err => {
        handleAxiosError(err, res)
    })
})

router.get('/getClubsDividedByGroups', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getClubsDividedByGroups", {
        params: {
            competition_id: req.query.competition_id,
            season: req.query.season
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})
router.get('/getCompetitionSeasonsSorted', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getCompetitionSeasonsSorted", {
        params: {
            competition_id: req.query.competition_id,
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})

router.get('/getLastGamesByClubIdandSeason', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getLastGamesByClubIdandSeason", {
        params: {
            club_id: req.query.club_id,
            season: req.query.season
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})

router.get('/getSeasonsByClubId', function (req, res) {
    axios.get(EXPRESS_SERVER + "/games/getSeasonsByClubId", {
        params: {
            club_id: req.query.club_id
        }
    }).then(data => {
        res.status(data.status).send(data.data);

    }).catch(err => {

        handleAxiosError(err, res)
    })
})



module.exports = router;