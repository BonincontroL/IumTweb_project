var express = require('express');
let axios=require('axios')
var router = express.Router();

const { SPRING_SERVER } = require('./utils/constants');
const {handleAxiosError} = require('./utils/utils');

/**
 * Get player by competitionID
 */
router.get('/getPlayersByCompetition/:competition_id', function (req,res){
    axios.get(SPRING_SERVER+`/players/getPlayersByCompetition/${req.params.competition_id}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})

/**
 * return 5 random players that play in a competition in a certain season.
 */
router.get('/get5RandomPlayersByCompIdAndLastSeason/:competition_id/:last_season', function (req,res){
    axios.get(`${SPRING_SERVER}/players/get5RandomPlayersByCompIdAndLastSeason/${req.params.competition_id}/${req.params.last_season}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})
/**
 * get the top market value players in a certain competition and year
 */
router.get('/getPlayersByCompetitionAndLastSeasonSortedByValue/:competition_id/:last_season', function (req,res){
    axios.get(`${SPRING_SERVER}/players/getPlayersByCompetitionAndLastSeasonSortedByValue/${req.params.competition_id}/${req.params.last_season}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
/**
 * Get player Img Url by player id
 */
router.get("/getPlayersImgUrlById", function (req,res){
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
 */
router.get("/searchByClubIdAndSeason", function (req,res){
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
 * get di tutti i giocatori
 */
router.get("/getAllPlayers", function (req,res){
    axios.get(SPRING_SERVER+"/players/getAllPlayers")
        .then(data=>{
                res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})
router.get("/getTop50PlayersByMarketValue", function (req,res){
    axios.get(SPRING_SERVER+"/players/getTop50PlayersByMarketValue")
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})

router.get("/getTop150PlayersByMarketValue", function (req,res){
    axios.get(SPRING_SERVER+"/players/getTop150PlayersByMarketValue")
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
        })
})


router.get("/findPlayersByLetterInName", function (req,res){
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


router.get("/getPlayerById/:playerId", function (req,res){
    axios.get(SPRING_SERVER+`/players/getPlayerById/${req.params.playerId}`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})

router.get("/getAllDomesticCompetitions", function (req,res){
    axios.get(SPRING_SERVER+`/players/getAllDomesticCompetitions`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
router.get("/getAllCountryOfCitizenship", function (req,res){
    axios.get(SPRING_SERVER+`/players/getAllCountryOfCitizenship`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
router.get("/getSubPositionsGroupedByPosition", function (req,res){
    axios.get(SPRING_SERVER+`/players/getSubPositionsGroupedByPosition`)
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
router.get("/getByCompIdNationalityAndRole", function (req,res){
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

