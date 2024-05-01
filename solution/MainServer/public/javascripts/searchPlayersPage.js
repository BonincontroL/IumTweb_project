/**
 * Initializes the player search page.
 */
const DOMESTIC_COMPETITION_ROUTE = "/getAllDomesticCompetitions"
const POSITIONS_ROUTE="/getSubPositionsGroupedByPosition"
const NATIONALITIES_ROUTE="/getAllCountryOfCitizenship"
let filteredCompetition=null, filteredNation=null, filteredRole=null
document.addEventListener('DOMContentLoaded', () => {
    try {
        manageFilterPopup() //gestisce la comparsa e scomparsa del popup dei filtri
        manageDropdownFilters()
        manageApplyAndResetButtons()
        manageEventDelegation()
        initLogin();
        fetchAndCategorizePlayers();
        const searchInput = document.getElementById('search-players');
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

/**
 * execute different get to server to obtain the dropdown menu values
 * and then call the render of the different dropdown menus
 */
function manageDropdownFilters(){
    Promise.all([
        getDropdownValues(DOMESTIC_COMPETITION_ROUTE),
        getDropdownValues(NATIONALITIES_ROUTE),
        getDropdownValues(POSITIONS_ROUTE)
    ]).then(res=>{
        renderCompetitionsDropdown(res[0].data)
        renderNationalitiesDropdown(res[1].data)
        renderPositionsDropdown(res[2].data)
    }).catch(err=>{
        alert(err)
    })
}

/**
 * generic function that get dropdown values
 * @param route the specific route in players api
 * @returns {*}
 */
function getDropdownValues(route){
    let url= "http://localhost:3000/players"+route
    return axios.get(url)
}

/**
 * Manages the apply and reset filter buttons.
 */
function manageApplyAndResetButtons(){
    let applyFilterBtn = document.getElementById('doFilteredSearch')
    let resetFilterBtn= document.getElementById('resetFilters')
    let errorLabel=document.getElementById('errorLabel')
    applyFilterBtn.addEventListener('click',()=>{
        if(filteredCompetition===null && filteredNation ===null && filteredRole ===null)
            errorLabel.style.display='block'
        else{
            errorLabel.style.display='none'
            doFilteredSearch()
        }
    })
    resetFilterBtn.addEventListener('click',()=>{
        filteredRole=filteredNation=filteredCompetition=null;
        resetDropdownMenus() //resettiamo tutti i dropdown
    })
}

/**
 * Resets the dropdown menus.
 */
function resetDropdownMenus(){
    document.getElementById('playerRoles').selectedIndex=0;
    document.getElementById('playerNationalities').selectedIndex=0;
    document.getElementById('playerCompetitions').selectedIndex=0;
}


/**
 * Executes a filtered search based on applied filters.
 */
function doFilteredSearch(){
    axios.get("http://localhost:3000/players/getByCompIdNationalityAndRole",{
        params: {
            competitionId:filteredCompetition,
            nation:filteredNation,
            specificRole:filteredRole
        }
    }).then(res=>{
        let players=res.data
        if(players.length!==0) {
            let categorizedPlayers = categorizePlayersByRole(res.data)
            displayPlayersByRole(categorizedPlayers);
        }else
            alert("Nessun giocatore trovato con i seguenti filtri, riprova!")
    }).catch(err=>{
        alert(err)
    })
}

/**
 * Renders the competitions dropdown.
 * @param {Array} competitions - The array of competitions.
 */
function renderCompetitionsDropdown(competitions){
    let selectCompetition = document.getElementById('playerCompetitions')
    competitions.forEach(competition=>{
        let option= document.createElement('option')
        option.value=competition.id;
        option.text=competition.name;
        selectCompetition.appendChild(option)
    })
    selectCompetition.addEventListener('change',function (){
        filteredCompetition=this.value;
    })
}

/**
 * Renders the nationalities dropdown.
 * @param {Array} nationalities - The array of nationalities.
 */
function renderNationalitiesDropdown(nationalities){
    let optionContainer= document.getElementById('playerNationalities')
    nationalities.forEach(nation=>{
        let newOption= document.createElement('option')
        newOption.value= newOption.text= nation
        optionContainer.appendChild(newOption)
    })
    optionContainer.addEventListener('change',function (){
        filteredNation=this.value;
    })
}


/**
 * Renders the positions dropdown.
 * @param {Object} positions - The object containing positions.
 */
function renderPositionsDropdown(positions){
    const optionContainer = document.getElementById('playerRoles')
    Object.keys(positions).forEach(position=>{
        const optionGroup=document.createElement('optgroup')
        optionGroup.label=position

        positions[position].forEach(subPosition=>{
            const option =document.createElement('option')
            option.value=option.textContent=subPosition
            optionGroup.appendChild(option)
        })
        optionContainer.appendChild(optionGroup)
    })
    optionContainer.addEventListener('change',function (){
        filteredRole=this.value
    })
}

/**
 * Debounce a function to limit the speed of its execution.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The debounce wait time.
 * @returns {(function(): void)|*} - The debounced function.
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
    if (searchText.length !== 0) {
        findPlayersByLetter(searchText);
    }else{
        fetchAndCategorizePlayers();
        document.getElementById('popupNoContent').style.display='none'
    }
}

/**
 * Fetches players from the server and categorizes them.
 */
function fetchAndCategorizePlayers() {
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';
    fetchPlayers()
        .then(players => {
            if(players.data.length!==0) {
                const playersByRole = categorizePlayersByRole(players.data);
                displayPlayersByRole(playersByRole);
            }
        })
        .catch(error => {
            console.error('Errore durante il recupero e la categorizzazione dei giocatori:', error);
        }).finally(()=>{
            loadingSpinner.style.display = 'none';
        });
}

/**
 * Fetches players from the server.
 * @returns {Promise<unknown>} - The Axios promise object.
 */
function fetchPlayers() {
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';

    return axios.get('http://localhost:3000/players/getTop150PlayersByMarketValue')
}

/**
 * Categorizes players by role.
 * @param {Array} players - The array of players.
 * @returns {Object} - The object containing categorized players.
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
 * Displays players by role.
 * @param {Object} playersByRole - The object containing players categorized by role.
 */
function displayPlayersByRole(playersByRole) {
    Object.keys(playersByRole).forEach(role => {
        const mainContainer= document.getElementById(`${role}MainContainer`)
        if(playersByRole[role].length===0)
            mainContainer.style.display='none'
        else {
            mainContainer.style.display='flex'
            const playersContainer = mainContainer.querySelector('.player-row-container')
            renderPlayers(playersByRole[role], playersContainer);
        }
    });
}

/**
 * Renders players.
 * @param {Array} players - The array of players.
 * @param {HTMLElement} container - The container to render players.
 */
function renderPlayers(players, container) {

    container.innerHTML = '';

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card2';
        playerDiv.setAttribute('data-playerid',player.playerId)
        playerDiv.setAttribute('data-name',player.name)
        playerDiv.setAttribute('data-imageurl',player.imageUrl)

        playerDiv.innerHTML = `
            <img src="${player.imageUrl}" alt="${player.name}" class="player-image">
            <div class="player-info">
                <h3>${player.name}</h3>
                 <img src="https://tmssl.akamaized.net/images/wappen/head/${player.currentClubId}.png" alt="${player.currentClubName} Icon" class="club-icon">
                <h4>${player.currentClubName}</h4>
            </div>
        `;
        container.appendChild(playerDiv);
    });
}

/**
 * Finds players by letter.
 * @param {string} letter - The letter to search for.
 */
function findPlayersByLetter(letter) {
    axios.get(`http://localhost:3000/players/findPlayersByLetterInName`, { params: { letter } })
        .then(response => {
            const players = response.data;
            if(players.length!==0) {
                const playersByRole = categorizePlayersByRole(players);
                displayPlayersByRole(playersByRole);
                document.getElementById('popupNoContent').style.display='none'
            }else{
                document.getElementById('popupNoContent').style.display='flex'
            }
        })
        .catch(error => {
            console.error('Error during search:', error);
        });
}
