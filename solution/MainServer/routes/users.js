var express = require('express');
let axios=require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

const {handleAxiosError} = require('./utils/utils');


/**
 * receives data from the client and sends it to the server to complete the registration
 *
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
 * receives data from the client and sends it to the ExpressServer to complete the log-in
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
