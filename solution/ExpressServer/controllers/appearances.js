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

function getPlayerStatisticsFor2023(playerId) {
    return Model.aggregate([
        {
            $match: {
                player_id: playerId, // Filtro per player_id

            }
        },
        {
            $group: {
                _id: '$player_id',
                total_goals: { $sum: '$goals' },
                total_assists: { $sum: '$assists' },
                total_yellow_cards: { $sum: '$yellow_cards' },
                total_red_cards: { $sum: '$red_cards' },
                appearances: { $sum: 1 },
                player_name: { $first: '$player_name' }
            }
        },
        {
            $project: {
                _id: 0,
                player_id: '$_id',
                player_name: 1,
                total_goals: 1,
                total_assists: 1,
                total_yellow_cards: 1,
                total_red_cards: 1,
                appearances: 1
            }
        }
    ]);
}



module.exports={
    getTopScorer,
    getPlayerStatisticsFor2023
}