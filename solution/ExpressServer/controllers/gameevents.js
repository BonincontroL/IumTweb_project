const Model = require('../models/gameevents')
const Games= require("../models/games")
const GameLineups = require("../models/gamelineups")
function getTopScorer(comp_id, season){
    return Model.aggregate([
        {
            $lookup:{
                from:Games.collection.name,
                let:{game_id:"$game_id"},
                pipeline:[
                    {$match: {$expr:{$and:[
                                    {$eq:['$game_id','$$game_id']},
                                    {$eq:['$competition_id',comp_id]},
                                    {$eq:['$season',season]}
                ]}}}],
                as:"gameDetails"
            }
        },
        {
            $match:{'gameDetails.0':{$exists:true},type:'Goals'}
        },
        {
            $lookup:{
                from:GameLineups.collection.name,
                let:{player_id:'$player_id',game_id:'$game_id'},
                pipeline:[
                    {$match:{$expr:{$and:[{$eq:['$player_id','$$player_id']},{$eq:['$game_id','$$game_id']}]}}},
                    {$project:{player_name:1}}
                ],
                as:'playerDetails'
            }
        },
        {
            $unwind:"$playerDetails"
        },
        {
            $group:{
                _id:"$player_id",
                goalsScored:{$sum:1},
                player_name:{$first:"$playerDetails.player_name"}
            }
        },
        {
            $sort:{
                goalsScored:-1
            }
        },
        {
            $limit:5 //per ora prendo solo i primi 10
        }
    ])
}

/**
 * return all the game events in a single match, divided by home and away team.
 * @param gameId
 * @param homeClubId
 * @param awayClubId
 */
function getMatchEvents(gameId,homeClubId,awayClubId){
    return Model.aggregate([
        {
            $match:{
                game_id:gameId
            }
        },
        {
            $lookup:{
                from:GameLineups.collection.name,
                localField:"player_id",
                foreignField:"player_id",
                as:"playerDetails"
            }
        },
        {
            $unwind:{path:'$playerDetails',preserveNullAndEmptyArrays:true}
        },
        {
            $group:{
                _id:null,
                homeEvents:{
                    $push:{
                        $cond:[{$eq:["$club_id",homeClubId]},'$$ROOT','$$REMOVE']
                    }
                },
                awayEvents:{
                    $push:{
                        $cond:[{$eq:["$club_id",awayClubId]},'$$ROOT','$$REMOVE']
                    }
                },
            }
        },
        {
            $project:{
                _id:0,
                homeEvents:1,
                awayEvents:1
            }
        }
    ])
}
module.exports={
    getTopScorer,
    getMatchEvents
}