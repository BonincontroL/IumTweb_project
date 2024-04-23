var express = require('express');
let axios=require('axios')
var router = express.Router();

const { EXPRESS_SERVER, SPRING_SERVER } = require('./utils/constants');

module.exports=router

const {handleAxiosError} = require('./utils/utils');

router.get('/getMatchEvents', function (req,res){
    axios.get(EXPRESS_SERVER+"/gameevents/getMatchEvents",
        {params:{
                game_id:req.query.game_id
            }})
        .then(data=>{
            res.status(data.status).send(data.data);
        }).catch(err=>{
        handleAxiosError(err, res)
    })
})
