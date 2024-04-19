/**
 * Inizializza il processo di login e recupera i giocatori non appena il DOM è completamente caricato.
 *
 * @ToDO ---> implemntare funz di ricerca giocatori
 *
 */
document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    fetchPlayersAndCategorize();
});

/**
 * Recupera i dati dei giocatori dal server e li categorizza per ruolo.
 * Gestisce il processo completo di recupero e visualizzazione dei dati.
 */
function fetchPlayersAndCategorize() {
    fetchPlayers()
        .then(players => {
            const playersByRole = categorizePlayersByRole(players);
            displayPlayersByRole(playersByRole);
        })
        .catch(error => {
            console.error('Errore durante il recupero e la categorizzazione dei giocatori:', error);
        });
}

/**
 * Recupera i giocatori dal server.
 * @returns {Promise<Array>} Una promise che si risolve in un array di oggetti giocatore.
 */
function fetchPlayers() {
    return axios.get('http://localhost:8081/players/getTop50PlayersByMarketValue')
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
}

/**
 * Categorizza i giocatori in base ai loro ruoli, utilizzando le loro posizioni.
 * @param {Array} players - Array di oggetti giocatore da categorizzare.
 * @returns {Object} Un oggetto con array di giocatori categorizzati in base al ruolo.
 */
function categorizePlayersByRole(players) {
    const roles = {
        Goalkeepers: [],
        Defenders: [],
        Midfielders: [],
        Strikers: []
    };

    players.forEach(player => {
        const position = player.subPosition.toLowerCase();
        if (position.includes('goalkeeper')) {
            roles.Goalkeepers.push(player);
        } else if (position.includes('defender') || position.includes('back')) {
            roles.Defenders.push(player);
        } else if (['midfield', 'central midfield', 'right midfield', 'left midfield', 'attacking midfield', 'defensive midfield'].some(role => position.includes(role))) {
            roles.Midfielders.push(player);
        } else if (['forward', 'striker', 'winger', 'attack', 'centre-forward'].some(role => position.includes(role))) {
            roles.Strikers.push(player);
        } else {
            console.log(`Ruolo sconosciuto: ${player.position}`);
        }
    });

    return roles;
}

/**
 * Visualizza i giocatori per ruolo.
 * @param {Array} players - Array di giocatori da visualizzare.
 * @param {string} containerId - ID del contenitore DOM dove visualizzare i giocatori.
 */
function displayPlayersByRole(playersByRole) {
    renderPlayers(playersByRole.Goalkeepers, 'GoalkeepersContainer');
    renderPlayers(playersByRole.Defenders, 'DefenderContainer');
    renderPlayers(playersByRole.Midfielders, 'MidfieldContainer');
    renderPlayers(playersByRole.Strikers, 'StrikerContainer');
}

/**
 * Funzione per visualizzare i giocatori.
 * @param {Array} players - Array di giocatori da visualizzare.
 * @param {string} containerId - ID del contenitore dove inserire i giocatori.
 */
function renderPlayers(players, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.innerHTML = `
            <img src="${player.imageUrl}" alt="${player.name}" class="player-image">
            <div class="player-info">
                <h3>${player.name}</h3>
            </div>
        `;
        container.appendChild(playerDiv);
    });
}
