const Model = require('../models/gameevents')
const Games= require("../models/games")
const GameLineups = require("../models/gamelineups")
const Appearences= require("../models/appearances")

/**
 * return all the game events in a single match,sorted by minutes.
 * @param gameId
 */
function getMatchEvents(gameId){
    return Model.aggregate([
        {
            $match:{
                game_id:gameId
            }
        },
        {
            $lookup:{
                from:Appearences.collection.name,
                localField: 'player_id',
                foreignField: 'player_id',
                as:'player_info'
            }
        },
        {
            $lookup:{
                from:Appearences.collection.name,
                localField: 'player_assist_id',
                foreignField: 'player_id',
                as:'assist_info'
            }
        },
        {
            $lookup:{
                from:Appearences.collection.name,
                localField: 'player_in_id',
                foreignField: 'player_id',
                as:'substitute_info'
            }
        },
        {
            $project:{
                _id:0,
                club_id:1,
                type:1,
                minute:1,
                description:1,
                player:{$arrayElemAt:['$player_info.player_name',0]},
                assist:{$arrayElemAt:['$assist_info.player_name',0]},
                substitute:{$arrayElemAt:['$substitute_info.player_name',0]},
            }
        },
        {
            $sort:{minute:-1}
        }
        ])
}
module.exports={
    getMatchEvents
}