const Model = require('../models/games');

/**
 * Get all games
 * @returns {Promise} Promise object represents the list of games
 */
function getAllGames() {
    return Model.find({})
        .then(results => {
            if (!results || results.length === 0) {
                throw new Error('Nessun match trovato.');
            }
            return results;
        })
        .catch(error => {
            throw new Error('Errore durante il recupero dei giochi: ' + error.message);
        });
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
        .then(results => {
            if (!results || results.length === 0) {
                throw new Error('Nessun match trovato.');
            }
            return results;
        })
        .catch(error => {
            throw new Error('Errore durante il recupero dei giochi: ' + error.message);
        });
}

function getLast5GamesByClubId(club_id){
    return Model.find({
        $or:[
            {home_club_id:club_id},
            {away_club_id:club_id}
        ]
    },{home_club_id:1, away_club_id:1, home_club_goals:1, away_club_goals:1, date:1})
        .sort({date:-1})
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
                season: season //il + serve per trasformare il valore season in un numero
            }
        },
        {
            $group: {
                _id: "$round",
                firstDate:{$min:"$date"}
            }
        },
        {
            $sort:{firstDate:1}
        },
        {
            $project: {
                round: "$_id",
                _id: 0
            }
        }
    ])
}

function getTableByCompSeasonAndType(comp_id,season,type,round){
    let initialMatchCondition ={}
    let matchConditions={
        competition_id: comp_id,
        season: season
    }
    if(round)
        matchConditions.round = round

    if(type==='home')
        initialMatchCondition={
            $expr:{$eq:["$home_club_id","$events.club_id"]}
        };
    else if(type==='away')
        initialMatchCondition={
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
        {
            $addFields:{
                "is_home":{$eq:["$home_club_id","$events.club_id"]}
            }
        },
        ...Object.keys(initialMatchCondition).length > 0?[{$match:initialMatchCondition}]: [],
        {
            $addFields:{
                "club_name":{
                    $cond:{
                        if:{$eq:["$is_home",true]},
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
                vittorie:{
                    $sum:{
                        $cond:[{$gt:["$events.own_goals", "$events.opponent_goals"]},1,0]
                    }
                },
                pareggi:{
                    $sum:{
                        $cond:[{$eq:["$events.own_goals", "$events.opponent_goals"]},1,0]
                    }
                },
                sconfitte:{
                    $sum:{
                        $cond:[{$lt:["$events.own_goals", "$events.opponent_goals"]},1,0]
                    }
                },
                gol_fatti:{$sum:"$events.own_goals"},
                gol_subiti:{$sum:"$events.opponent_goals"},
                punti:{
                    $sum:{
                        $cond:[
                            {$gt:["$events.own_goals","$events.opponent_goals"]},3,
                            {$cond:[{$eq:["$events.own_goals","$events.opponent_goals"] },1,0]}
                        ]
                    }
                }
            }
        },
        {
            $sort:{punti:-1, gol_fatti:-1}
        }
    ]).then(data=>{
        if(!data || data.length===0)
            throw new Error("Errore durante il recupero della classifica\n")
        else
            return data
    }).catch(err=>{
        throw new Error("Errore durante il recupero della classifica:"+err.message+"\n")
    })
}

function getMatchesByCompAndSeasonAndRound(comp_id,season,round){
    return Model.aggregate([
        {
            $match:{
                competition_id:comp_id,
                season:season,
                round:round
            }
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
    ]).then(data=>{
        if(!data || data.length===0)
            throw new Error("Errore durante il recupero delle partite della giornata :"+round+" della competizione:"+comp_id+"della stagione: "+season+"\n")
        else
            return data
    }).catch(err=>{
        throw new Error("Errore durante il recupero delle partite della giornata :"+round+" della competizione:"+comp_id+"della stagione: "+season+"\nMessaggio di errore: "+err+"\n")
    })
}
function getRefreeStadiumAndManagers(game_id){
    return Model.findOne({game_id:game_id},'referee stadium home_club_manager_name away_club_manager_name')
        .then(data=>{
            return data;
        }).catch(err=>{
            throw new Error("Errore durante il recupero di una singola partita con game_id:"+game_id+"\n L'errore è il seguente: "+err+"\n")
        })
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
    ]).then(data=>{
        if(!data || data.length===0)
            throw new Error("Errore durante il recupero dell'ultimo allenatore")
        else
            return data
    }).catch(err=>{
        throw new Error("Errore durante il recupero dell'ultimo allenatore\nCodice errore:"+err+"\n")
    })
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
            competition_id: competitionId,
            season: season
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
 * Get games by game ID
 * @param gameId
 * @returns {Promise<unknown>}
 */
function getGamesByGameId(gameId) {
    return new Promise((resolve, reject) => {
        Model.findOne({ game_id: gameId })
            .then(result => {
                if (!result) {
                    reject('Nessun match trovato per questo ID games.');
                } else {
                    resolve(result);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Get the last  games of a club in a certain season
 * @param club_id
 * @param season
 */
function getLastGamesByClubIdandSeason(club_id, season) {
    return Model.find({
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
    })

        .sort({date: -1})

}


/**
 * ritornano tutte le stagioni in cui la squadra ha almeno giocato una partita
 * @param club_id
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
    getAllGames,
    getLast5Games,
    getLast5GamesByClubId,
    getRoundNumbers,
    getTableByCompSeasonAndType,
    getMatchesByCompAndSeasonAndRound,
    getRefreeStadiumAndManagers,
    getLastManager,
    getGamesByCompetitionIdAndSeason,
    getCompetitionsByClubAndSeason,
    getClubsDividedByGroups,
    getCompetitionIdsWithGroup,
    getCompetitionSeasonsSorted,
    getGamesByGameId,
    getLastGamesByClubIdandSeason,
    getSeasonsByClubId
};
