const Model = require('../models/appearances')


/**
 * Retrieves the top scorers for a given competition.
 * @param competitionId
 * @returns {Aggregate<Array<any>>}
 */
function getTopScorer(competitionId){
    return Model.aggregate([
        {
            $match:{
                competition_id:competitionId
            }
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

/**
 * Retrieves statistics for a specific player.
 * @param playerId
 * @returns {Promise<Array<any>>}
 */
function getPlayerStatistics(playerId) {
    const numericPlayerId = parseInt(playerId, 10);

    return Model.aggregate([
        {
            $match: {
                player_id: numericPlayerId
            }
        },
        {
            $group: {
                _id: '$player_id',
                total_goals: { $sum: '$goals' },
                total_assists: { $sum: '$assists' },
                total_yellow_cards: { $sum: '$yellow_cards' },
                total_red_cards: { $sum: '$red_cards' },
                total_minutes_played: { $sum: '$minutes_played' },
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
                appearances: 1,
                total_minutes_played: 1
            }
        }
    ])
        .then(data => {
            return data;
        })
        .catch(err => {
            console.error(`Error retrieving statistics for player ID ${playerId}`, err);
            throw err;
        });
}

/**
 * Retrieves games played by a specific player.
 * @param playerId
 * @returns {Aggregate<Array<any>>}
 */
function getPlayerGames(playerId) {
    const numericPlayerId = parseInt(playerId, 10);
    return Model.aggregate([
        {
            $match: {
                player_id: numericPlayerId,
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
            $unwind:"$game_info"
        },
        {
            $project:{
                _id:0,
                season:"$game_info.season",
                round:"$game_info.round",
                date:"$game_info.date",
                game_id:"$game_info.game_id",
                home_club_id:"$game_info.home_club_id",
                away_club_id:"$game_info.away_club_id",
                home_club_name:"$game_info.home_club_name",
                away_club_name:"$game_info.away_club_name",
                competition_id:"$game_info.competition_id",
                aggregate:"$game_info.aggregate",
                player_club_id:1,
                yellow_cards:1,
                red_cards:1,
                goals:1,
                assists:1,
                minutes_played:1
            }
        },
        {
            $sort: {date: -1}
        }
    ]);
}



module.exports={
    getTopScorer,
    getPlayerStatistics,
    getPlayerGames
}