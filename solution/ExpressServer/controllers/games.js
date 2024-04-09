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

module.exports = {
    getAllGames
};
