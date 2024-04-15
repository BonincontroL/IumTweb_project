const Model = require('../models/gameevents')
function getTopScorer(comp_id, season){
    return Model.aggregate([
        {
            $match:{
                type:"Goals"
            }
        },
        {
            $lookup:{
                from:"games",
                localField:"game_id",
                foreignField:"game_id",
                as:"game_info"
            }
        },
        {
            $match:{
                "game_info.competition_id":comp_id,
                "game_info.season":season
            }
        },
        {
            $unwind:"$game_info"
        },
        {
            $group:{
                _id:"$player_id",
                goalsScored:{$sum:1},
                player_info:{$first:"$player_info"}
            }
        },
        {
            $sort:{
                goalsScored:-1
            }
        },
        {
            $limit:10 //per ora prendo solo i primi 10
        }
    ])
}
module.exports={getTopScorer}