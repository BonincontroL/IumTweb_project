var express = require('express');
let axios=require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

const {handleAxiosError} = require('./utils/utils');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * Riceve i dati dal client e li manda al express server per completare la registrazione
 */
router.post('/register', function (req, res) {
    axios.post(EXPRESS_SERVER + '/users/register', req.body)
        .then(response => {
            res.status(response.status).send(response.data);
        })
        .catch(err => {
            handleAxiosError(err, res)
        });
});


/**
 * Riceve i dati dal client e li manda al express server per il login

 */
router.post('/login', function (req, res) {
    axios.post(EXPRESS_SERVER + '/users/login', req.body)
        .then(response => {
            if (response.status === 200) {
                res.status(200).send(response.data);
            } else {
                res.status(response.status).send(response.data);
            }
        })
        .catch(err => {
            handleAxiosError(err, res)
        });
});


module.exports = router;
