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
                game_id:"$game_id",
                home_club_id:"$home_club_id",
                away_club_id:"$away_club_id",
                home_club_name:"$home_club_name",
                away_club_name:"$away_club_name",
                date:"$date",
                aggregate:"$aggregate"
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
 * Get games by competition ID and round
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

module.exports = {
    getAllGames,
    getLast5Games,
    getLast5GamesByClubId,
    getRoundNumbers,
    getTableByCompSeasonAndType,
    getMatchesByCompAndSeasonAndRound,
    getRefreeStadiumAndManagers,
    getLastManager,
    getGamesByCompetitionIdAndSeason
};
