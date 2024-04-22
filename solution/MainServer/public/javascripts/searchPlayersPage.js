/**
 * Funzione per inizializzare la pagina di ricerca dei giocatori.
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        manageFilterButton()
        initLogin();
        fetchAndCategorizePlayers();
        const searchInput = document.getElementById('search-players');
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
function manageFilterButton(){
    let filterButton= document.getElementById('filterButton')
    let filterContainer= document.getElementById('filterContainer')
    document.addEventListener('click',function (event){
        if(filterButton.contains(event.target))
            filterContainer.style.display='flex'
        else
            filterContainer.style.display='none'
    })

}
/**
 * Funzione per il debounce per limitare la velocità con cui viene chiamata una funzione.
 * @param func
 * @param wait
 * @returns {(function(): void)|*}
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Funzione per gestire la ricerca dei giocatori.
 * @param event
 */
function handleSearch(event) {
    const searchText = event.target.value.trim();
    if (searchText.length > 0) {
        findPlayersByLetter(searchText);
    }
}

/**
 * Funzione per recuperare i giocatori dal server e categorizzarli.
 */
function fetchAndCategorizePlayers() {
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
 * Funzione per recuperare i giocatori dal server.
 * @returns {Promise<unknown>}
 */
function fetchPlayers() {
    return axios.get('http://localhost:3000/players/getTop150PlayersByMarketValue')
        .then(response => response.data)
        .catch(error => {
            console.error('Failed to fetch players:', error);
            throw error;
        });
}

/**
 * Funzione per categorizzare i giocatori in base al ruolo.
 * @param players
 * @returns {{Goalkeepers: *[], Defender: *[], Midfield: *[], Striker: *[]}}
 */
function categorizePlayersByRole(players) {
    const roles = { Goalkeepers: [], Defender: [], Midfield: [], Striker: [] };
    players.forEach(player => {
        const position = player.subPosition ? player.subPosition.toLowerCase() : '';
        if (position.includes('goalkeeper')) {
            roles.Goalkeepers.push(player);
        } else if (position.includes('defender') || position.includes('back')) {
            roles.Defender.push(player);
        } else if (position.includes('midfield') || ['central midfield', 'right midfield', 'left midfield', 'attacking midfield', 'defensive midfield'].some(role => position.includes(role))) {
            roles.Midfield.push(player);
        } else if (position.includes('forward') || position.includes('striker') || position.includes('winger') || position.includes('attack') || position.includes('centre-forward')) {
            roles.Striker.push(player);
        } else {
            console.log(`Unknown role: ${player.subPosition}`);
        }
    });
    return roles;
}

/**
 * Funzione per visualizzare i giocatori in base al ruolo.
 * @param playersByRole
 */
function displayPlayersByRole(playersByRole) {
    Object.keys(playersByRole).forEach(role => {
        const containerId = `${role}Container`;
        renderPlayers(playersByRole[role], containerId);
    });
}

/**
 * Funzione per renderizzare per visualizzare i giocatori.
 * @param players
 * @param containerId
 */
function renderPlayers(players, containerId) {

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card2';
        playerDiv.setAttribute('data-playerid',player.playerId)
        playerDiv.setAttribute('data-name',player.name)
        playerDiv.setAttribute('data-imageurl',player.imageUrl)

        const playerContent = `
            <img src="${player.imageUrl}" alt="${player.name}" class="player-image">
            <div class="player-info">
                <h3>${player.name}</h3>
                 <img src="https://tmssl.akamaized.net/images/wappen/head/${player.currentClubId}.png" alt="${player.currentClubName} Icon" class="club-icon">
                <h4>${player.currentClubName}</h4>
            </div>
        `;

        playerDiv.innerHTML = playerContent;
        playerDiv.addEventListener('click',()=>{
            let playerInfo ={
                playerId:playerDiv.getAttribute('data-playerid'),
                name:playerDiv.getAttribute('data-name'),
                imageUrl:playerDiv.getAttribute('data-imageurl'),
            }
            sessionStorage.setItem('playerInfo',JSON.stringify(playerInfo))
            window.location.href='../player_page.html'
        })
        container.appendChild(playerDiv);
    });
}

/**
 * Funzione per cercare i giocatori per lettera.
 * @param letter
 */
function findPlayersByLetter(letter) {
    axios.get(`http://localhost:3000/players/findPlayersByLetterInName`, { params: { letter } })
        .then(response => {
            const players = response.data;
            const playersByRole = categorizePlayersByRole(players);
            displayPlayersByRole(playersByRole);
        })
        .catch(error => {
            console.error('Error during search:', error);
        });
}
