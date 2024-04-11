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
        return data
    }).catch(err=>{
        throw new Error("Errore durante il recupero dei nomi dei round"+err.message)
    })
}

module.exports = {
    getAllGames,
    getLast5Games,
    getRoundNumbers
};
