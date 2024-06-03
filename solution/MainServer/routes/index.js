var express = require('express');
let axios=require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

const {handleAxiosError} = require('./utils/utils');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('landing_page.html');
});

module.exports = router;



