/**
 * Inizializza il processo di login e recupera i giocatori non appena il DOM è completamente caricato.
 *
 * @ToDO ---> migliorare la ricerca dei giocatori
 *
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        initLogin();
        fetchPlayersAndCategorize();
        const searchInput = document.getElementById('search-players');
        searchInput.addEventListener('input', handleSearch);
    }catch (e){
        console.error('Error during initialization:', e);
    }

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
    return axios.get('http://localhost:3000/players/getTop50PlayersByMarketValue')
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

    const cssStyles = `
        .player-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 1px solid #ccc;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px;
            min-width: 250px; // Minima larghezza per coerenza visiva
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            background-color: #ffffff;
            transition: transform 0.3s ease;
        }
        .player-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }
        .player-image {
            width: auto;
            height: auto;
            object-fit: cover;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .player-info {
            padding: 15px;
            text-align: center;
            width: 100%;
        }
        .player-info h3 {
            margin: 10px 0 5px;
            color: #333;
            font-size: 18px;
        }
        .player-info h4 {
            margin: 5px 0 10px;
            color: #555;
            font-style: italic;
            font-size: 16px;
        }
        .club-icon {
            width: 40px; 
            height: 40px;
            border-radius: 50%;
            box-shadow: 0 2px 3px rgba(0,0,0,0.3);
            background-color: #fff;
            position: relative;
        }
    `;

    const styleSheet = document.createElement('style');
    document.head.appendChild(styleSheet);
    styleSheet.innerText = cssStyles;

    container.innerHTML = '';


    players.forEach(player => {

        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';

        const playerContent = `
            <img src="${player.imageUrl}" alt="${player.name}" class="player-image">
            <div class="player-info">
                <h3>${player.name}</h3>
                 <img src="https://tmssl.akamaized.net/images/wappen/head/${player.currentClubId}.png" alt="${player.currentClubName} Icon" class="club-icon">
                <h4>${player.currentClubName}</h4>
            </div>
        `;


        playerDiv.innerHTML = playerContent;

        container.appendChild(playerDiv);
    });
}

/**
 * Gestisce l'input di ricerca dei giocatori.
 * @param event
 */
function handleSearch(event) {
    const searchText = event.target.value;
    if (searchText.length > 0) {
        findPlayersByLetter(searchText);
    } else {
        console.log("Inserisci almeno una lettera per iniziare la ricerca");
    }
}

/**
 * Cerca i giocatori il cui nome inizia con una lettera specifica.
 * @param letter
 */
function findPlayersByLetter(letter) {
    axios.get(`http://localhost:3000/players/findPlayersByLetterInName`, {
        params: { letter: letter }
    })
        .then(response => {
            console.log('Players found:', response.data);
            sortAndDisplayPlayers(response.data);
        })
        .catch(error => {
            console.error('Error during search:', error);
        });
}

/**
 * Ordina e visualizza i giocatori in base al ruolo.
 * @param players
 */
function sortAndDisplayPlayers(players) {
    const playersByRole = {
        Goalkeepers: [],
        Defenders: [],
        Midfielders: [],
        Strikers: []
    };

    players.forEach(player => {
        const position = player.subPosition ? player.subPosition.toLowerCase() : '';
        if (position.includes('goalkeeper')) {
            playersByRole.Goalkeepers.push(player);
        } else if (position.includes('defender') || position.includes('back')) {
            playersByRole.Defenders.push(player);
        } else if (position.includes('midfield') || ['central midfield', 'right midfield', 'left midfield', 'attacking midfield', 'defensive midfield'].some(role => position.includes(role))) {
            playersByRole.Midfielders.push(player);
        } else if (position.includes('forward') || position.includes('striker') || position.includes('winger') || position.includes('attack') || position.includes('centre-forward')) {
            playersByRole.Strikers.push(player);
        } else {
            console.log(`Unknown role: ${player.subPosition}`);
        }
    });

    clearPlayerContainers();
    renderPlayers(playersByRole.Goalkeepers, 'GoalkeepersContainer');
    renderPlayers(playersByRole.Defenders, 'DefenderContainer');
    renderPlayers(playersByRole.Midfielders, 'MidfieldContainer');
    renderPlayers(playersByRole.Strikers, 'StrikerContainer');
}

/**
 * Svuota i contenitori dei giocatori.
 */
function clearPlayerContainers() {
    document.getElementById('GoalkeepersContainer').innerHTML = '';
    document.getElementById('DefenderContainer').innerHTML = '';
    document.getElementById('MidfieldContainer').innerHTML = '';
    document.getElementById('StrikerContainer').innerHTML = '';
}