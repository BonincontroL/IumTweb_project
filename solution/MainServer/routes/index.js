var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"
const SPRING_SERVER="http://localhost:8081"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('landing_page.html');
});

router.get('/getCompetitionInformation', function (req,res){
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
          res.status(err.status).send(err)
      })
})

module.exports = router;



