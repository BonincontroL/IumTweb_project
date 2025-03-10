var express = require('express');
let axios = require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

const {handleAxiosError} = require('./utils/utils');
/**
 * get competition by id
 * @param competition_id the id of the competition
 * @returns competition information
 */
router.get('/getCompetitionInformation', function (req,res){
    if (!req.query.competition_id) {
        return res.status(400).json({ error: 400, message: 'Competition ID is required' });
    }
    axios.get(SPRING_SERVER+"/competitions/get",{params:{
            competition_id:req.query.competition_id
        }
    })
        .then(data=>{
            if (data.status === 200) {
                res.send(data.data);
            }else{
                res.status(data.status).send(data.data);
            }
        })
        .catch(err=>{
            handleAxiosError(err, res)
        })
})

/**
 * Get all competitions
 * @returns list of all competitions
 */
router.get('/getAllCompetitions', function (req, res) {
    axios.get(SPRING_SERVER + "/competitions/getAllCompetitions")
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    });
})

/**
 * Retrieve all competitions grouped by country
 * @returns Map of competitions grouped by country in a list.
 */
router.get('/getCompetitionsGroupedByCountry', function (req, res) {
    axios.get(SPRING_SERVER + "/competitions/getCompetitionsGroupedByCountry")
        .then(data => {
            res.status(data.status).send(data.data);
        }).catch(err => {
        handleAxiosError(err, res)
    })
})

/**
 * Retrieve competition name by competition ID
 * @param competition_id the id of the competition
 * @returns  name of the competition
 */
router.get('/getName', function (req, res) {
    if (!req.query.competition_id) {
        return res.status(400).json({ error: 400, message: 'Competition ID is required' });
    }
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

