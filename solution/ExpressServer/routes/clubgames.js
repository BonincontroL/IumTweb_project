var express = require('express');
var router = express.Router();

//=> Enable Cross-Origin Resource Sharing (CORS) middleware to allow cross-origin requests
const cors = require('cors');
router.use(cors());

const clubgamesController = require("../controllers/clubgames") //=>Controller
const { isDataEmpty } = require('./utils/utils'); //=> Utility function

module.exports=router