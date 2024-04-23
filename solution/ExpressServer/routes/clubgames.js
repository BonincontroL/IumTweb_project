var express = require('express');
var router = express.Router();

const cors = require('cors');
router.use(cors());
const clubgamesController = require("../controllers/clubgames")
const { isDataEmpty } = require('./utils/utils');

module.exports=router