var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001";
const SPRING_SERVER="http://localhost:8081";

/**
 * Get player number by player id
 */
router.get('/getPlayerNumberByIdPlayer/:idPlayer', function (req,res){
    axios.get(EXPRESS_SERVER+"/gamelineups/getPlayerNumberByIdPlayer/"+req.params.idPlayer)
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})





module.exports = router;