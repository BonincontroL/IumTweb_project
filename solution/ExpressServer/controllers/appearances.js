const Model = require('../models/appearances')

function getTopScorer(competitionId){
    return Model.aggregate([
        {
            $match:{competition_id:competitionId}
        },
        {
            $group:{
                _id:'$player_id',
                total_goals:{$sum:'$goals'},
                player_name:{$first:'$player_name'}
            }
        },
        {
            $sort:{total_goals:-1}
        },
        {
            $limit:10
        }
    ])
}
module.exports={
    getTopScorer
}