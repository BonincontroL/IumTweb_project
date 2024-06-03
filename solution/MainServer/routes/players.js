var express = require('express');
let axios=require('axios')
var router = express.Router();

const { SPRING_SERVER } = require('./utils/constants');
const {handleAxiosError} = require('./utils/utils');

/**
 * Get player by competitionID
 * @param competition_id the id of the competition
 * @returns list of players that play in a certain competition
 */
router.get('/getPlayersByCompetition/:competition_id', function (req,res){
    if (!req.params.competition_id) {
        return res.status(400).json({ error: 400, message: 'Competition ID is required' });
    }
    axios.get(SPRING_SERVER+`/players/getPlayersByCompetition/${req.params.competition_id}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})

/**
 * return 5 random players that play in a competition in a certain season.
 * @param competition_id the id of the competition
 * @param last_season the  last season of the competition
 * @return list of 5 random players that play in a certain competition in a certain season
 */
router.get('/get5RandomPlayersByCompIdAndLastSeason/:competition_id/:last_season', function (req,res){
    if (!req.params.competition_id || !req.params.last_season) {
        return res.status(400).json({ error: 400, message: 'Competition ID and Last Season are required' });
    }
    axios.get(`${SPRING_SERVER}/players/get5RandomPlayersByCompIdAndLastSeason/${req.params.competition_id}/${req.params.last_season}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})
/**
 * get the top market value players in a certain competition and year
 * @param competition_id the id of the competition
 * @param last_season the last season of the competition
 * @return  list sorted by value players in a certain competition and year
 */
router.get('/getPlayersByCompetitionAndLastSeasonSortedByValue/:competition_id/:last_season', function (req,res){
    if (!req.params.competition_id || !req.params.last_season) {
        return res.status(400).json({ error: 400, message: 'Competition ID and Last Season are required' });
    }
    axios.get(`${SPRING_SERVER}/players/getPlayersByCompetitionAndLastSeasonSortedByValue/${req.params.competition_id}/${req.params.last_season}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
/**
 * Get player Img Url by player id
 * @param player_id the id of the player
 * @return map with  url of the player img
 */
router.get("/getPlayersImgUrlById", function (req,res){
    /*if (!req.query.starting || !req.query.substitutes) {
        return res.status(400).json({ error: 400, message: 'Starting and Substitutes are required' });
    }*/
    axios.get(SPRING_SERVER+"/players/getPlayersImgUrlById",{
        params:{
            starting:req.query.starting,
            substitutes:req.query.substitutes
        }
    }).then(data=>{
        res.status(data.status).send(data.data);
    }).catch(err=>{
        handleAxiosError(err, res)
    })
})

/**
 * search player by club id and season
 * @param club_id the id of the club
 * @return list of players that play in a certain club in a certain season
 */
router.get("/searchByClubIdAndSeason", function (req,res){
    if (!req.query.club_id || !req.query.season) {
        return res.status(400).json({ error: 400, message: 'Club ID and Season are required' });
    }
    axios.get(SPRING_SERVER+"/players/searchByClubIdAndSeason",{
        params:{
            club_id:req.query.club_id,
            season:req.query.season
        }
    }).then(data=>{
        res.status(data.status).send(data.data);
    }).catch(err=>{
        handleAxiosError(err, res)
    })
})

/**
 * get All players
 * @return  list of all players
 */
router.get("/getAllPlayers", function (req,res){
    axios.get(SPRING_SERVER+"/players/getAllPlayers")
        .then(data=>{
                res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})

/**
 *  the top 150 players sorted by their market value in a descending manner
 * @return list of the top 150 players sorted by their market value in a descending manner
 */
router.get("/getTop150PlayersByMarketValue", function (req,res){
    axios.get(SPRING_SERVER+"/players/getTop150PlayersByMarketValue")
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})

/**
 * search player by name
 * @param name the name of the player or a string that is contained in the name
 * @return  list of players that have the name or the string in their name
 */
router.get("/findPlayersByLetterInName", function (req,res){
    if (!req.query.letter) {
        return res.status(400).json({ error: 400, message: 'Letter is required' });
    }
    axios.get(SPRING_SERVER+"/players/findPlayersByLetterInName",{
        params:{
            letter:req.query.letter
        }
    }).then(data=>{
        res.status(data.status).send(data.data);
    }).catch(err=>{
        handleAxiosError(err, res)
    })
})

/**
 * get player by id
 * @param player_id the id of the player
 * @return player by id
 */
router.get("/getPlayerById/:playerId", function (req,res){
    if (!req.params.playerId) {
        return res.status(400).json({ error: 400, message: 'Player ID is required' });
    }
    axios.get(SPRING_SERVER+`/players/getPlayerById/${req.params.playerId}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})

/**
 * get all DomesticCompetition
 * @return list of all DomesticCompetition
 */
router.get("/getAllDomesticCompetitions", function (req,res){
    axios.get(SPRING_SERVER+`/players/getAllDomesticCompetitions`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
/**
 * Get all the nationalities",
 * @return list of all the nationalities

 */
router.get("/getAllCountryOfCitizenship", function (req,res){
    axios.get(SPRING_SERVER+`/players/getAllCountryOfCitizenship`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
/**
 * Get sub positions grouped by position"
 * @return map with all the possible subPosition that are in Players table (for example: Left Winger) grouped by general position (for example: Striker) of sub positions grouped by position
 */
router.get("/getSubPositionsGroupedByPosition", function (req,res){
    axios.get(SPRING_SERVER+`/players/getSubPositionsGroupedByPosition`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
/**
 * Get players by competition id Nationality and Role
 * @param competitionId the id of the competition
 * @param nation
 * @param specificRole
 * @return list of players that play in a certain competition and have Nationality and Role
 */
router.get("/getByCompIdNationalityAndRole", function (req,res){
    /*if (!req.query.competitionId || !req.query.nation || !req.query.specificRole) {
        return res.status(400).json({ error: 400, message: 'Competition ID, Nation, and Specific Role are required' });
    }*/
    axios.get(SPRING_SERVER+`/players/getByCompIdNationalityAndRole`,{
        params:{
            competitionId:req.query.competitionId,
            nation:req.query.nation,
            specificRole:req.query.specificRole
        }
    })
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
module.exports = router;

