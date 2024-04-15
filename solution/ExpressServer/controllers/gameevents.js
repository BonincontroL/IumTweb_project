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
                from:GameLineups.collection.name,
                let:{player_id:'$player_id', club_id:'$club_id'},
                pipeline:[
                    { $match: { $expr: { $and: [{ $eq: ['$player_id', '$$player_id'] }, { $eq: ['$game_id', gameId] }] } }},
                    { $project: { player_name: 1} }
                ],
                as:'playerDetails'
            }
        },
        {
            $unwind:{path:'$playerDetails',preserveNullAndEmptyArrays:true}
        },
        {
            $project:{
                _id:0,
                club_id:1,
                type:1,
                minute:1,
                description:1,
                player_name:'$playerDetails.player_name',
                player_id:'$playerDetails.player_id',
                player_assist_id:1,
                player_in_id:1
            }
        },
        {
            $sort:{minute:-1}
        }])
}
module.exports={
    getTopScorer,
    getMatchEvents
}