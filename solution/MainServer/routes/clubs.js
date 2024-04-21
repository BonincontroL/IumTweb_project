var express = require('express');
let axios=require('axios')
var router = express.Router();
const SPRING_SERVER="http://localhost:8081"

router.get('/searchByCompetitionAndSeason', function (req,res){
    axios.get(SPRING_SERVER + "/clubs/searchByCompetitionAndSeason",{params:{
            competition_id: req.query.competition_id,
            season:req.query.season
        }
    })
        .then(data=>{
            if (data.status === 200) {
                res.send(data.data);
            }else{
                res.status(data.status).send(data.data);
            }
        }).catch(err=>{
        res.status(500).send(err)
    });
})
router.get('/getLastSeason', function (req,res){
    axios.get(SPRING_SERVER + "/clubs/getLastSeason",{params:{
            club_id: +req.query.club_id,
        }
    }).then(data=>{
        if (data.status === 200) {
            res.send(data.data);
        }else{
            res.status(data.status).send(data.data);
        }
    }).catch(err=>{
        res.status(err.status).send(err)
    });
})

/**
 * get al SpringServer per tutte le squadre suddivise per il carattere iniziale
 */
router.get('/getAllClubsByInitial', function (req, res) {
    axios.get(SPRING_SERVER+"/clubs/getAllClubsByInitial")
        .then(response => {
            if (response.status === 200) {
                res.send(response.data);
            }else{
                res.status(response.status).send(response.data);
            }
        }).catch(error => {
        res.status(error.status).send(error)
    });
});



module.exports= router

