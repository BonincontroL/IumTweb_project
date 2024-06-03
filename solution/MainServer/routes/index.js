var express = require('express');
let axios=require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

const {handleAxiosError} = require('./utils/utils');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('landing_page.html');
});
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

module.exports = router;



