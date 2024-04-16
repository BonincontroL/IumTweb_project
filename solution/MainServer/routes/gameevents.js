var express = require('express');
let axios=require('axios')
var router = express.Router();
const EXPRESS_SERVER="http://localhost:3001"

module.exports=router

router.get('/getMatchEvents', function (req,res){
    axios.get(EXPRESS_SERVER+"/gameevents/getMatchEvents",
        {params:{
                game_id:req.query.game_id
            }})
        .then(data=>{
            res.send(data.data)
        }).catch(err=>{
        res.send(err)
    })
})
