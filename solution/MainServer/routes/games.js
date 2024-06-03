var express = require('express');
let axios = require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');


const {handleAxiosError} = require('./utils/utils');
/**
 * Get last matches (games) by competition id
 * @param competitionId the id of the competition
 * @return object represents the list of games
 */
router.get('/getLastMatchesByCompetition/:competitionId', function (req, res) {
    if (!req.params.competitionId) {
        return res.status(400).json({ error: 400, message: 'Competition ID is required' });
    }
    axios.get(EXPRESS_SERVER + "/games/getLastMatchesByCompetition/" + req.params.competitionId)
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})

/**
 * get round numbers by competition id and season
 * @param comp_id the id of the competition
 * @param season the season of the competition
 * @return object represents  all the possible round in a competition in a certain season
 */

router.get('/getRoundNumbers', function (req, res) {
    if (!req.query.comp_id || !req.query.season) {
        return res.status(400).json({ error: 400, message: 'Competition ID and season are required' });
    }
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
 * @param comp_id the id of the competition
 * @param season the season of the competition
 * @param currentRound the round of the competition
 * @return object represents  all the games in a certain round of a competition in a certain season
 */
router.get('/getMatchesByCompAndSeasonAndRound', function (req, res) {
    if (!req.query.comp_id || !req.query.season ) {
        return res.status(400).json({ error: 400, message: 'Competition ID, season are required' });
    }
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
/**
 * get all game infos , based on club_id
 * @param club_id the id of the club
 * @return object represents  all the games of a club
 */
router.get('/get', function (req, res) {
    if (!req.query.game_id) {
        return res.status(400).json({ error: 400, message: 'Game ID is required' });
    }
    axios.get(EXPRESS_SERVER + "/games/get", {
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
 * @param club_id the id of the club
 * @return object represents  the last manager of a club
 */
router.get('/getLastManager', function (req, res) {
    if (!req.query.club_id) {
        return res.status(400).json({ error: 400, message: 'Club ID is required' });
    }
    axios.get(EXPRESS_SERVER + "/games/getLastManager", {
        params: {
            club_id: req.query.club_id
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})

/**
 * "Get table by competition,season,type and round
 * @param comp_id the id of the competition
 * @param season the season of the competition
 * @param type the type of the competition
 * @param round the round of the competition
 * @return object whit information  about a competition table in a certain season that is a classification where squads are ordered based on the games played.
 */
router.get('/getTableByCompSeasonAndType', function (req, res) {
    if (!req.query.comp_id || !req.query.season || !req.query.type) {
        return res.status(400).json({ error: 400, message: 'Competition ID, season, type are required' });
    }

    axios.get(EXPRESS_SERVER + "/games/getTableByCompSeasonAndType", {
        params: {
            comp_id: req.query.comp_id,
            season: req.query.season,
            type: req.query.type,
            round: req.query.group
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

/**
 * get clubs divided by groups
 * @param competition_id the id of the competition
 * @param season the season of the competition
 * @return object with clubs divided by groups based on the provided competition ID and season.
 */
router.get('/getClubsDividedByGroups', function (req, res) {
    if (!req.query.competition_id || !req.query.season) {
        return res.status(400).json({ error: 400, message: 'Competition ID and season are required' });
    }
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
/**
 * Get competition seasons sorted
 * @param competition_id the id of the competition
 * @return object with competition seasons sorted in descending order based on the provided competition ID
 */
router.get('/getCompetitionSeasonsSorted', function (req, res) {
    if (!req.query.competition_id) {
        return res.status(400).json({ error: 400, message: 'Competition ID is required' });
    }
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

/**
 * Get last games by club id and season
 * @param club_id the id of the club
 * @param season the season of the competition
 * @param limit the number of games to be returned
 * @return object with the last games of a club in a certain season
 */
router.get('/getLastGamesByClubIdandSeason', function (req, res) {
    if (!req.query.club_id || !req.query.season) {
        return res.status(400).json({ error: 400, message: 'Club ID, season' });
    }
    axios.get(EXPRESS_SERVER + "/games/getLastGamesByClubIdandSeason", {
        params: {
            club_id: req.query.club_id,
            season: req.query.season,
            limit:req.query.limit
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})
/**
 * information about all the season numbers when the club (specified by club_id) played at least one game
 * @param club_id the id of the club
 * @returns object with all the season numbers when the club played at least one game
 */
router.get('/getSeasonsByClubId', function (req, res) {
    if (!req.query.club_id) {
        return res.status(400).json({ error: 400, message: 'Club ID is required' });
    }
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

/**
 * Get head to head statistics
 * @param homeClubId the id of the home club
 * @param awayClubId the id of the away club
 * @returns object with the number of win of the home club, the number of draws and the number of win of the away club
 */
router.get('/getHeadToHead', function (req, res) {
    if (!req.query.homeClubId || !req.query.awayClubId) {
        return res.status(400).json({ error: 400, message: 'Home Club ID and Away Club ID are required' });
    }
    axios.get(EXPRESS_SERVER + "/games/getHeadToHead", {
        params: {
            homeClubId: req.query.homeClubId,
            awayClubId: req.query.awayClubId
        }
    }).then(data => {
        res.status(data.status).send(data.data);
    }).catch(err => {
        handleAxiosError(err, res)
    })
})



module.exports = router;