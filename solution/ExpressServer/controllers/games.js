const Model = require('../models/games');

/**
 * Get all games -- no filters applied -- TEST DI PROVA
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
function getRoundNumbers(comp_id,season){
    return Model.aggregate([{
        $match: {
            competition_id: comp_id,
            season: season //il + serve per trasformare il valore season in un numero
        }
    },
        {
            $group: {
                _id: "$round"
            }
        },
        {
            $project: {
                round: "$_id",
                _id: 0
            }
        }
    ]).then(data=>{
        if(!data || data.length ===0)
            throw new Error("Errore durante il recupero dei nomi dei round")
        else
            return data
    }).catch(err=>{
        throw new Error("Errore durante il recupero dei nomi dei round"+err.message)
    })
}

function getTableByCompSeasonAndType(comp_id,season,type){
    let initialMatchCondition ={}
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
            $match:{
                competition_id: comp_id,
                season: season,
            }
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
module.exports = {
    getAllGames,
    getLast5Games,
    getRoundNumbers,
    getTableByCompSeasonAndType
};
