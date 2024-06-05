const Model = require('../models/games');
const tableTypes={
    FULL:"FULL",
    HOME:"HOME",
    AWAY:"AWAY"
}

/**
 * Get last 5 games by competition ID
 * @param competition_id
 * @returns {Promise} Promise object represents the list of games
 */
function getLast5Games(competition_id) {
    return Model.find({competition_id:competition_id})
        .sort({ date: -1 })
        .limit(5)
}


/**
 * Get the round numbers of a competition and season
 * @param comp_id
 * @param season
 * @returns {Aggregate<Array<any>>}
 */
function getRoundNumbers(comp_id,season){
    return Model.aggregate([
        {
            $match: {
                competition_id: comp_id,
                season: season
            }
        },
        {
            $group: {
                _id: "$round",
                firstDate:{$min:"$date"}
            }
        },
        {
            $facet: {
                groupRounds:[
                    {
                        $match:{
                            _id:{$regex:/^Group/}
                        }
                    },
                    {
                        $sort:{_id:1}
                    },
                    {
                        $project:{
                            round:"$_id",
                            _id:0
                        }
                    }
                ],
                otherRounds:[
                    {
                        $match:{_id:{$not:{$regex:/^Group/}}}
                    },
                    {
                        $sort:{firstDate:1}
                    },
                    {
                        $project:{
                            round:"$_id",
                            _id:0
                        }
                    }
                ]
            }
        }
    ])
}

/**
 * Retrieves the table standings by competition, season, type, and round.
 * The round parameter is only used when the competition have groups, to retrive
 * the group table, if the competition hasn't groups, round is undefined
 * @param comp_id the competition id
 * @param season the season we want to filter
 * @param type the type of table, could be full, home, away and change what matches we take to calculate the table
 * @param round the round we want table for, is undefined if the competition hasn't groups.
 * @returns {Promise<Array<any>>}
 */
function getTableByCompSeasonAndType(comp_id,season,type,round){
    let tableTypologyCondition ={}
    let matchConditions={
        competition_id: comp_id,
        season: season
    }
    if(round)
        matchConditions.round = round

    if(type===tableTypes.HOME)
        tableTypologyCondition={
            $expr:{$eq:["$home_club_id","$events.club_id"]}
        };
    else if(type===tableTypes.AWAY)
        tableTypologyCondition={
            $expr:{$eq:["$away_club_id","$events.club_id"]}
        };
    return Model.aggregate([
        {
            $match: matchConditions
        },
        {
            $lookup:{
                from:"clubgames",
                localField:"game_id",
                foreignField:"game_id",
                as: "events"
            }
        },
        {
            $unwind:"$events"
        },
        ...Object.keys(tableTypologyCondition).length > 0?[{$match:tableTypologyCondition}]: [], //add tableTypologyCondition if there are some conditions, otherwise the pipeline is unmuted.
        {
            $addFields:{
                "club_name":{
                    $cond:{
                        if:{$eq:["$events.hosting","Home"]},
                        then:"$home_club_name",
                        else:"$away_club_name"
                    }
                }
            }
        },
        {
            $group:{
                _id:"$events.club_id",
                club_name:{$first:"$club_name"},
                wins:{
                    $sum:{
                        $cond:[{$gt:["$events.own_goals", "$events.opponent_goals"]},1,0]
                    }
                },
                draws:{
                    $sum:{
                        $cond:[{$eq:["$events.own_goals", "$events.opponent_goals"]},1,0]
                    }
                },
                loses:{
                    $sum:{
                        $cond:[{$lt:["$events.own_goals", "$events.opponent_goals"]},1,0]
                    }
                },
                goals_scored:{$sum:"$events.own_goals"},
                goals_taken:{$sum:"$events.opponent_goals"},
                points:{
                    $sum:{
                        $cond:[
                            {$gt:["$events.own_goals","$events.opponent_goals"]},3,
                            {$cond:[{$eq:["$events.own_goals","$events.opponent_goals"] },1,0]}
                        ]
                    }
                },
                goalDifference: { $sum:{$subtract: ["$events.own_goals", "$events.opponent_goals"]}}
            }
        },
        {
            $sort:{points:-1, goalDifference:-1}
        }
    ])
}
/**
 * Retrieves matches by competition, season, and round.
 * @param comp_id
 * @param season
 * @param round
 * @returns {Promise<Array<any>>}
 */
function getMatchesByCompAndSeasonAndRound(comp_id,season,round){
    const matchCriteria = {
        competition_id: comp_id,
        season: season
    };

    if (round !== undefined) {
        matchCriteria.round = round;
    }
    return Model.aggregate([
        {
            $match:matchCriteria
        },
        {
            $sort:{
                date:1
            }
        },
        {
            $project:{
                _id:0, //tolgo l'id dal risultato
            }
        }
    ])
}

/**
 * Retrieves all the game information by its ID.
 * @param game_id
 * @returns {Promise<Object>}
 */
function get(game_id){
    return Model.findOne({game_id:game_id},{_id:0})
}

/**
 * Get the last manager of a club
 * @param club_id
 * @returns {Promise<Array<any>>}
 */
function getLastManager(club_id){
    return Model.aggregate([
        {
            $match:{
                $or:[
                    {home_club_id:club_id},
                    {away_club_id:club_id}
                ]
            }
        },
        {
            $sort:{
                date:-1
            }
        },
        {
            $limit:1 //prendi il primo risultato
        },
        {
            $project:{
                _id:0,
                name:{
                    $cond:{
                        if:{$eq:["$home_club_id", club_id]},
                        then:"$home_club_manager_name",
                        else:"$away_club_manager_name"
                    }
                }
            }
        }
    ])
}

/**
 * Get games by competition ID and Season
 * @param competitionId
 * @param season
 * @returns {Promise<unknown>}
 */
function getGamesByCompetitionIdAndSeason(competitionId,season) {
    return new Promise((resolve, reject) => {
        Model.find({
            competition_id:competitionId,
            season:season
        })
            .sort({ date: -1 })
            .then(results => {
                if (!results || results.length === 0) {
                    reject('Nessun match trovato per questa season e competizione.');
                } else {
                    resolve(results);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * get the competitions that a club played in a certain season
 * @param club_id
 * @param season
 * @returns {Aggregate<Array<any>>}
 */
function getCompetitionsByClubAndSeason(club_id,season){
    return Model.aggregate([
        {
            $match:{
                $or:[{home_club_id:club_id},{away_club_id:club_id}],
                season:season
            }
        },
        {
            $group:{
                _id:"$competition_id"
            }
        }
    ]);
}

/**
 * search all the clubs that played in a certain competition and season
 * and divide it into groups (Group A,Group B, Group C...)
 * query ONLY used for competition that have groups!
 * @param competition_id should be a competition with groups
 * @param season the season we want
 */
function getClubsDividedByGroups(competition_id,season){
    return Model.aggregate([
        {
            $match: {
                competition_id: competition_id,
                season: season,
            }
        },
        {
            $group:{
                _id:"$round",
                clubs:{
                    $addToSet:{
                        $setUnion: [  // Combine and deduplicate arrays of club details
                            [{ name: "$home_club_name", clubId: "$home_club_id" }],
                            [{ name: "$away_club_name", clubId: "$away_club_id" }]
                        ]
                    }
                }
            }
        },
        {
            $sort:{
              _id:1
            }
        },
        {
            $project:{
                _id:0,
                group:"$_id",
                clubs:{
                    $reduce: {  // Flatten the set of club arrays into a single array
                        input: "$clubs",
                        initialValue: [],
                        in: { $setUnion: ["$$value", "$$this"] }
                    }                }
            }
        }
    ]);
}

/**
 * return a list of competition_id that are all the competitions
 * with groups
 */
function getCompetitionIdsWithGroup(){
   return Model.aggregate([
       {
           $match:{
               round:/Group/
           }
       },
       {
           $group:{
               _id:"$competition_id"
           }
       },
       {
           $project:{
               _id:0,
               competition_id:"$_id"
           }
       }
   ])
}

/**
 * Get all the seasons of a competition sorted by descending order
 * @param competition_id
 * @returns {Aggregate<Array<any>>}
 */
function getCompetitionSeasonsSorted(competition_id){
    return Model.aggregate([
        {
            $match:{
                competition_id:competition_id
            }
        },
        {
            $group:{
                _id:"$season"
            }
        },
        {
            $sort:{
                _id:-1
            }
        },
        {
            $project:{
                _id:0,
                season:"$_id"
            }
        }
    ])
}

/**
 * Get the last games of a club in a certain season
 * if limit isn't undefined, the result is limited
 * @param club_id
 * @param season
 * @param limit the number of results that we want
 */
function getLastGamesByClubIdandSeason(club_id, season,limit) {
    const query = Model.find({
        $or: [
            {home_club_id: club_id},
            {away_club_id: club_id}
        ],
        season: season

    }, {
        _id: 0,
        season: 1,
        round: 1,
        date: 1,
        game_id: 1,
        home_club_id: 1,
        away_club_id: 1,
        home_club_name: 1,
        away_club_name: 1,
        competition_id: 1,
        aggregate: 1
    }).sort({date: -1})
    if(limit)
        query.limit(limit)

    return query
}

/**
 * Given home club id and away club id, retrives the number of win of the home club,
 * the number of draws and the number of win of the away club
 * @param homeClubId the identifier of the club that played at home in the match whose statistics we are interested in
 * @param awayClubId the identifier of the club that played away in the match whose statistics we are interested in
 * @returns {Aggregate<Array<any>>}
 */
function getHeadToHead(homeClubId, awayClubId){
    return Model.aggregate([
        {
            $match: {
                $or: [
                    {home_club_id: homeClubId, away_club_id: awayClubId},
                    {home_club_id: awayClubId, away_club_id: homeClubId}
                ]
            }
        },
        {
            //adding result field to determine match outcome
            $project: {
                home_club_id: 1,
                away_club_id: 1,
                home_club_goals: 1,
                away_club_goals: 1,
                result: {
                    $cond: {
                        if: {$gt: ["$home_club_goals", "$away_club_goals"]},
                        then: 'home_win',
                        else: {
                            $cond: {
                                if: {$lt: ["$home_club_goals", "$away_club_goals"]},
                                then: 'away_win',
                                else: 'draw'
                            }
                        }
                    }
                }

            }
        },
        {
            $group: {
                _id: null, //we put id only because is necessary for group operator
                homeWins: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    {
                                        $and: [
                                            {$eq: ["$result", "home_win"]},
                                            {$eq: ["$home_club_id", homeClubId]}
                                        ]
                                    },
                                    {
                                        $and: [
                                            {$eq: ["$result", "away_win"]},
                                            {$eq: ["$away_club_id", homeClubId]}
                                        ]
                                    }
                                ]

                            }, 1, 0]
                    }
                },
                awayWins: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    {$and: [
                                            {$eq: ["$result", "away_win"]},
                                            {$eq: ["$away_club_id", awayClubId]}
                                        ]
                                    },
                                    {$and: [
                                            {$eq: ["$result", "home_win"]},
                                            {$eq: ["$home_club_id", awayClubId]}
                                        ]
                                    }
                                ]
                            }, 1, 0]
                    }
                },
                draws:{
                    $sum:{
                        $cond:[{$eq:["$result","draw"]},1,0]
                    }
                }
            }
        },
        { //remove the id to the result
            $project:{
                _id:0
            }
        }
    ])
}

/**
 * retrive all the seasons in which the club played at least one match
 * @param club_id the identifier of the club whose seasons we want
 * @returns {Aggregate<Array<any>>}
 */
function getSeasonsByClubId(club_id) {
    return Model.aggregate([
        {
            $match: {
                $or: [
                    { home_club_id: club_id },
                    { away_club_id: club_id }
                ]
            }
        },
        {
            $group: {
                _id: "$season"
            }
        },
        {
            $project: {
                _id: 0,
                season: "$_id"
            }
        },
        {
            $sort: { season: -1 }
        }
    ]);
}

module.exports = {
    getLast5Games,
    getRoundNumbers,
    getTableByCompSeasonAndType,
    getMatchesByCompAndSeasonAndRound,
    get,
    getLastManager,
    getCompetitionsByClubAndSeason,
    getClubsDividedByGroups,
    getCompetitionIdsWithGroup,
    getCompetitionSeasonsSorted,
    getLastGamesByClubIdandSeason,
    getSeasonsByClubId,
    getHeadToHead
};
