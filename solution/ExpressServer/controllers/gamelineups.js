const Model = require('../models/gamelineups');


//ToDo migliorare tale funzione + error
/**
 * Get player number by player ID
 * @param  playerId - ID of the player
 * @returns {Promise} Promise object represents the player number
 */
function getPlayerNumberByIdPlayer(playerId) {
    return Model.findOne({ player_id: playerId })
        .then(player => {
            if (!player) {
                return -1; // Player not found
            }
            return player.number;
        })
        .catch(error => {
            console.error('Errore durante il recupero del numero del giocatore: ' + error.message);
        });
}


module.exports = {
    getPlayerNumberByIdPlayer
};