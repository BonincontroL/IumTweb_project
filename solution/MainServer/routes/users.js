var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"
const SPRING_SERVER="http://localhost:8081"

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * Riceve i dati dal client e li manda al express server per completare la registrazione
 */
router.post('/register', function (req, res) {
  axios.get(EXPRESS_SERVER+'/users/register')
      .then(data => {
        res.send(data.data)
      }).catch(err => {
        res.send(err)
  });
});

module.exports = router;
