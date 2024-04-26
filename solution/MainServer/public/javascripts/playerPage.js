let lateralPlayerButtons, playerInfoBtn
const playerPageName= 'player-page'
let playerId;
let isStatsLoaded = false;
let isValutationLoaded = false;

document.addEventListener('DOMContentLoaded',()=> {

    fetchPlayerLastMatches();

    let playerInfo = JSON.parse(sessionStorage.getItem('playerInfo'))
    playerId = playerInfo.playerId

    Promise.all([
        getPlayerInfo(),
        getPlayerNumber(),
    ]).then(res=>{
        renderPlayerInfo(res[0].data,res[1].data.playerNumber)
    })

    renderPlayerImg(playerInfo)

    playerInfoBtn = document.getElementById('player-info-btn')
    lateralPlayerButtons = document.querySelectorAll('#playerLateralNavbar .lateral-menu-button')
    manageLateralButtons(lateralPlayerButtons, playerPageName)
    //inizialmente solo il bottone Informazioni è premuto

    playerInfoBtn.classList.add('active')
    hideAllMainContainers(playerPageName)
    document.getElementById('playerInformation').style.display = "flex"
    document.getElementById('player-statistic-btn').addEventListener('click', () => {
        if(!isStatsLoaded){
            getPlayerStatistics();
            isStatsLoaded = true;
        }
    });
    document.getElementById('player-valuation-btn').addEventListener('click', () => {
        if (!isValutationLoaded) {
            getPlayerValutation();
            isValutationLoaded = true;
           }
    });
    initLogin();
})
function renderPlayerImg(player){
    document.getElementById('playerName').innerText=player.name;
    document.getElementById('playerImage').setAttribute('src', player.imageUrl)
}

/**
 * get di tutte le statistiche di un singolo giocatore(cartellini gialli, rossi, goal e assist totali)
 */
function getPlayerStatistics() {
    const loadingSpinner= document.getElementById('loading-spinner');
    loadingSpinner.style.display = "block";
        axios.get(`http://localhost:3000/appearances/getPlayerStatistics/${playerId}`)
            .then(response => {
                if(response.status===200){
                    renderPlayerStatistics(response.data)
                }else{
                    renderPlayerStatistics([])
                }
            })
            .catch(error =>{
                console.error(`Error not found statistics for player ${playerId}:`, error);

            }).finally(()=> {
                loadingSpinner.style.display = "none";

        });
    }


    /**
     * funzione che scrive le statistiche del giocatore nella pagina.
     * @param playerStatistics
     */
    function renderPlayerStatistics(playerStatistics) {
        if(playerStatistics.length===0){
            document.getElementById('playerNumYellowCards').innerText = "No data available"
            document.getElementById('playerNumRedCards').innerText = "No data available"
            document.getElementById('playerNumGoals').innerText = "No data available"
            document.getElementById('playerNumAssists').innerText = "No data available"
            document.getElementById('playerNumMinutes').innerText = "No data available"
            document.getElementById('appearances').innerText = "No data available"
        }else{
            document.getElementById('playerNumYellowCards').innerText = playerStatistics[0].total_yellow_cards
            document.getElementById('playerNumRedCards').innerText = playerStatistics[0].total_red_cards
            document.getElementById('playerNumGoals').innerText = playerStatistics[0].total_goals
            document.getElementById('playerNumAssists').innerText = playerStatistics[0].total_assists
            document.getElementById('playerNumMinutes').innerText = playerStatistics[0].total_minutes_played
            document.getElementById('appearances').innerText = playerStatistics[0].appearances


        }

}

/**
 * funzione che scrive le informazioni del giocatore nella pagina.
 * @param playerInfo tutte le informazioni del player
 * @param playerNumber numero della maglia del giocatore
 */
    function renderPlayerInfo(playerInfo,playerNumber,flagUrl) {
        let oggi = new Date();
        let compleanno = new Date(playerInfo.dateOfBirth);
        let eta = oggi.getFullYear() - compleanno.getFullYear();
        document.getElementById('nationality').innerText = playerInfo.countryOfCitizenship;
        document.getElementById('player_height').innerText = playerInfo.heightInCm;
        document.getElementById('squad_player').innerText = playerInfo.currentClubName;
        document.getElementById('age_player').innerText = eta;
        document.getElementById('player_market_value').innerText = playerInfo.marketValueInEur+" €"
        document.getElementById('playerRole').innerText = playerInfo.subPosition;
        document.getElementById('squadLogo_player').setAttribute('src', clubLogoImgURL+playerInfo.currentClubId+".png")
        if(playerNumber===-1){
            document.getElementById('player_number').innerText = "No data available"
        }else {
            document.getElementById('player_number').innerText = playerNumber;
        }

    }



/**
 * funzione che restituisce le informazioni di un giocatore
 * @param playerId id del giocatore
 * @returns  object con le informazioni  di un giocatore
 */
    function getPlayerInfo(){
        return axios.get(`http://localhost:3000/players/getPlayerById/${playerId}`)
    }


    function getPlayerNumber(){
        return axios.get(`http://localhost:3000/gamelineups/getPlayerNumberByIdPlayer/${playerId}`)
    }


/**
 * get al server con parametro playerId per ottenere le valutazioni del giocatore per ogni anno medie.
 * restituisce un array di oggetti con la seguente struttura: [[year: number, market_value media: number]]
 */
function getPlayerValutation() {
        axios.get(`http://localhost:3000/player_valuations/getPlayerValuationPerYear/${playerId}`)
            .then(response => {
                if (response.status === 200) {
                    renderPlayerValuations(response.data)
                } else {
                    renderPlayerValuations([])
                }
            })
            .catch(error => {
                console.error(`Error not found statistics for player ${playerId}:`, error);
            })
    }

/**
 * funzione che scrive le valutazioni del giocatore nella pagina.
 * @param playerValuations tutte le valutazioni del giocatore medie per ogni anno
 */
function renderPlayerValuations(playerValuations) {
    let titleElement = document.getElementById('title_valuation');
    if (playerValuations.length === 0) {
        document.getElementById('playerValuation').innerText = "No data available";
        titleElement.innerText = "Valutazione";
    } else {
        let minYear = Infinity;
        let maxYear = -Infinity;
        let tableBody = document.querySelector('.table-valutation tbody');
        tableBody.innerHTML = '';

        playerValuations.forEach(function(valuation) {
            let year = valuation[0];
            if (year < minYear) minYear = year;
            if (year > maxYear) maxYear = year;

            let row = document.createElement('tr');
            let yearCell = document.createElement('td');
            yearCell.textContent = year;
            row.appendChild(yearCell);
            let valuationCell = document.createElement('td');
            valuationCell.textContent = valuation[1].toLocaleString() + ' €';
            row.appendChild(valuationCell);
            tableBody.appendChild(row);
        });

        if (minYear < Infinity && maxYear > -Infinity) {
            titleElement.innerText = `Valutazione (Da ${minYear} a ${maxYear})`;
        } else {
            titleElement.innerText = "Valutazione";
        }
    }
}

function fetchPlayerLastMatches(){
    const button = document.getElementById('player-lastMatches-btn');
    const lastMatchesContainer = document.getElementById('playerLastMatches');
    const loadingSpinner = document.getElementById('loading-spinner');
    lastMatchesContainer.innerHTML = '';

    button.addEventListener('click', async function () {
        try {
            loadingSpinner.style.display = 'block';
            let playerLastMatches = await axios.get(`http://localhost:3001/appearances/getPlayerLast5Games/${playerId}`);
            playerLastMatches = playerLastMatches.data;
            if (playerLastMatches.length === 0) {
                lastMatchesContainer.innerHTML = '<h1>N.D. - Nessuna partita trovata.</h1>';
            }else {
                renderPlayerMatches(playerLastMatches)
            }
            loadingSpinner.style.display = 'none';
        } catch (error) {
            console.error('Errore durante il recupero delle partite:', error);
            loadingSpinner.style.display = 'none';
        }
    });
}
function renderPlayerMatches(matches){
    const lastMatchesContainer = document.getElementById('playerLastMatches');
    lastMatchesContainer.innerHTML=''
    matches.forEach(match=>{
        let matchCard= renderPlayerMatch(match)
        lastMatchesContainer.appendChild(matchCard)
    })
}

function renderPlayerMatch(match){
    let homeStats={}, awayStats={}
    const gameInfoContainer = document.createElement('div');
    gameInfoContainer.classList.add('main-container');
    gameInfoContainer.classList.add('game-information');
    gameInfoContainer.classList.add('game-information-in-player');

    const roundAndDateContainer = document.createElement('div');
    roundAndDateContainer.classList.add('round-and-date-container');
    roundAndDateContainer.innerHTML = `
                    <p>${match.round}</p>
                    <p>${match.date.split('T')[0]}</p>
                `;
    gameInfoContainer.appendChild(roundAndDateContainer);

    const matchResultContainer = document.createElement('div');
    matchResultContainer.classList.add('match-result-vertical');
    if(match.player_current_club_id ===match.home_club_id)
        homeStats=createStats(match)
    else
        awayStats=createStats(match)

    const homeTeamContainer = createTeamContainer(match.home_club_name, match.aggregate.split(':')[0], match.home_club_id,homeStats);
    matchResultContainer.appendChild(homeTeamContainer);

    const awayTeamContainer = createTeamContainer(match.away_club_name, match.aggregate.split(':')[1], match.away_club_id,awayStats);
    matchResultContainer.appendChild(awayTeamContainer);

    gameInfoContainer.appendChild(matchResultContainer);

    return gameInfoContainer
}
function createStats(game){
    return {
        goals: game.goals,
        assists: game.assists,
        yellow_cards: game.yellow_cards,
        red_cards: game.red_cards,
        minutes_played: game.minutes_played
    }
}
/**
 * Crea un container con le informazioni di una squadra.
 * @param teamName
 * @param goals
 * @param teamId
 * @param stats
 * @returns {HTMLDivElement}
 */
function createTeamContainer(teamName, goals, teamId,stats) {
    const teamContainer = document.createElement('div');
    let goalsContainer = null,assistsContainer = null,yellowOrRedContainer =null
    teamContainer.classList.add('squad-info-row');

    const logoUrl = `https://tmssl.akamaized.net/images/wappen/head/${teamId}.png`;

    const displayedTeamName = teamName || 'N.D.';
    if(Object.keys(stats).length!==0) {//se l'oggetto stats c'è
        if (stats.goals !== 0)
            goalsContainer = renderGenericStatsContainer(stats.goals, "images/gameeventsLogos/goal-icon.svg")
        if (stats.assists !== 0)
            assistsContainer = renderGenericStatsContainer(stats.assists, "images/playerStatsIcons/assist-icon.svg")
        if (stats.yellow_cards !== 0 || stats.red_cards !== 0) {
            yellowOrRedContainer = document.createElement('img')
            yellowOrRedContainer.className = 'game-event-icon'
            yellowOrRedContainer.setAttribute('src', `${stats.yellow_cards === 0 ? 'images/gameeventsLogos/red-icon.svg' : 'images/gameeventsLogos/yellow-icon.svg'}`)
            yellowOrRedContainer.setAttribute('alt', `${stats.yellow_cards === 0 ? 'red card' : 'yellow card'}`)
        }
    }
    teamContainer.innerHTML = `
            <img class="squadLogo" loading="lazy" alt="" src="${logoUrl}">
            <h6 class="full-width-left">${displayedTeamName}</h6>
            ${goalsContainer!==null? goalsContainer.innerHTML: ''}
            ${assistsContainer!==null? assistsContainer.innerHTML: ''}
            ${yellowOrRedContainer!==null? yellowOrRedContainer.outerHTML: ''}
            <p>${goals}</p>
        `;
    return teamContainer;
}

function renderGenericStatsContainer(statistic, imageSrc){
    let container =document.createElement('div');
    container.className='match-goal-icon-container';
    container.innerHTML=
        `<p>${statistic}</p>
        <img
            class="game-event-icon"
            loading="lazy"
            alt=""
            src="${imageSrc}"
        />`

    return container
}



