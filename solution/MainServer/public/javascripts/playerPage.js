const PLAYER_PAGE_NAME = 'player-page' //=>Name of the player page.
let playerId; //=>Player ID.
let isStatsLoaded = false; //=>Flag to indicate if player statistics are loaded.
let isValutationLoaded = false; //=> Flag to indicate if player valuation is loaded.
let isLastMatchesLoaded = false; //=>Flag to indicate if player's last matches are loaded.
document.addEventListener('DOMContentLoaded', async () => {
    let playerInfo = JSON.parse(sessionStorage.getItem('playerInfo'))
    playerId = playerInfo.playerId
    try {
        let playerInfo = await getPlayerInfo()
        playerInfo = playerInfo.data
        let playerNumber = await getPlayerNumber()
        renderPlayerInfo(playerInfo, playerNumber.data.playerNumber)
    } catch (e) {
        alert(e)
    }
    renderPlayerImg(playerInfo)
    const lateralPlayerButtonContainer = document.querySelector('#playerLateralNavbar')
    manageLateralButtons(lateralPlayerButtonContainer, PLAYER_PAGE_NAME)
    manageEventDelegation()

    document.getElementById('playerInformation').style.display = "flex"
    document.getElementById('player-statistic-btn').addEventListener('click', () => {
        if (!isStatsLoaded) {
            getPlayerStatistics();
            isStatsLoaded = true;
        }
    });
    document.getElementById('player-valuation-btn').addEventListener('click', () => {
        if (!isValutationLoaded) {
            getPlayerValuation();
            isValutationLoaded = true;
        }
    });
    document.getElementById('player-lastMatches-btn').addEventListener('click', async () => {
        if (!isLastMatchesLoaded) {
            await fetchPlayerLastMatches();
            isLastMatchesLoaded = true;
        }
    });
    initLogin();
})

/**
 * Renders the player image.
 * @param {Object} player - Player object containing information.
 */
function renderPlayerImg(player) {
    document.getElementById('playerName').innerText = player.name;
    document.getElementById('playerImage').setAttribute('src', player.imageUrl)
}

/**
 * Retrieves all statistics of a player (yellow cards, red cards, goals, assists).
 */
function getPlayerStatistics() {
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = "block";
    axios.get(`${MAIN_SERVER}/appearances/getPlayerStatistics/${playerId}`)
        .then(response => {
            if (response.status === 200)
                renderPlayerStatistics(response.data)
            else if(response.status===204) //in this case,  204 no content
                renderPlayerStatistics([])
        })
        .catch(error => {
            console.error(`Error not found statistics for player ${playerId}:`, error);
        }).finally(() => {
        loadingSpinner.style.display = "none";
    });
}


/**
 * Renders player statistics on the page.
 * @param {Object[]} playerStatistics - Player statistics data.
 */
function renderPlayerStatistics(playerStatistics) {
    if (playerStatistics.length === 0) {
        document.getElementById('playerNumYellowCards').innerText = ND_VALUE
        document.getElementById('playerNumRedCards').innerText = ND_VALUE
        document.getElementById('playerNumGoals').innerText = ND_VALUE
        document.getElementById('playerNumAssists').innerText = ND_VALUE
        document.getElementById('playerNumMinutes').innerText = ND_VALUE
        document.getElementById('appearances').innerText = ND_VALUE
    } else {
        document.getElementById('playerNumYellowCards').innerText = playerStatistics[0].total_yellow_cards
        document.getElementById('playerNumRedCards').innerText = playerStatistics[0].total_red_cards
        document.getElementById('playerNumGoals').innerText = playerStatistics[0].total_goals
        document.getElementById('playerNumAssists').innerText = playerStatistics[0].total_assists
        document.getElementById('playerNumMinutes').innerText = playerStatistics[0].total_minutes_played
        document.getElementById('appearances').innerText = playerStatistics[0].appearances
    }

}

/**
 * Renders player information on the page.
 * @param {Object} playerInfo - All player information.
 * @param {number} playerNumber - Player's shirt number.
 */
function renderPlayerInfo(playerInfo, playerNumber) {
    let age
    if(playerInfo.dateOfBirth) { //if dateOfBirth is given...
        let today = new Date();
        let birthdayDate = new Date(playerInfo.dateOfBirth);
        age = today.getFullYear() - birthdayDate.getFullYear();
    }
    document.getElementById('nationality').innerText = playerInfo.countryOfCitizenship? playerInfo.countryOfCitizenship : ND_VALUE;
    document.getElementById('player_height').innerText = playerInfo.heightInCm ? playerInfo.heightInCm : ND_VALUE;
    document.getElementById('squad_player').innerText = playerInfo.currentClubName ? playerInfo.currentClubName : ND_VALUE;
    document.getElementById('age_player').innerText = age ? age: ND_VALUE; //if age is specified we put it into the container otherwise N.D.
    document.getElementById('player_market_value').innerText = playerInfo.marketValueInEur?   `${playerInfo.marketValueInEur} Eur`: ND_VALUE
    document.getElementById('playerRole').innerText = playerInfo.subPosition ? playerInfo.subPosition : ND_VALUE;
    document.getElementById('squadLogo_player').setAttribute('src', CLUB_LOGO_IMAGE_URL + playerInfo.currentClubId + ".png")
    document.getElementById('player_number').innerText = playerNumber === -1 ? ND_VALUE: playerNumber
    document.getElementById('player_number').innerText = `${playerNumber? playerNumber:ND_VALUE}`
}

/**
 * Retrieves player information.
 * @returns {Promise} - A promise with the player information.
 */
function getPlayerInfo() {
    return axios.get(`${MAIN_SERVER}/players/getPlayerById/${playerId}`)
}

/**
 * Retrieves player's shirt number.
 * @returns {Promise} - A promise with the player's shirt number.
 */
function getPlayerNumber() {
    return axios.get(`${MAIN_SERVER}/gamelineups/getPlayerNumberByIdPlayer/${playerId}`)
}
/**
 * Retrieves player valuation data.
 */
function getPlayerValuation() {
    axios.get(`${MAIN_SERVER}/player_valuations/getPlayerValuationPerYear/${playerId}`)
        .then(response => {
            if (response.status === 200)
                renderPlayerValuations(response.data)
            else if(response.status===204)
                renderPlayerValuations([])
        })
        .catch(error => {
            alert(`Error in finding valuations for player with player_id: ${playerId} \n`+error)
        })
}

/**
 * Renders player valuations on the page.
 * @param {Object[]} playerValuations - Player valuations data.
 */
function renderPlayerValuations(playerValuations) {
    let titleElement = document.getElementById('title_valuation');
    if (playerValuations.length === 0) {
        document.getElementById('tableValutation').remove()
        titleElement.innerText = "Nessuna valutazione disponibile...";
    } else {
        let minYear = Infinity;
        let maxYear = -Infinity;
        let tableBody = document.querySelector('#tableValutation > tbody');
        tableBody.innerHTML = '';

        playerValuations.forEach(function (valuation, index) {
            let year = valuation[0];
            if (year < minYear) minYear = year;
            if (year > maxYear) maxYear = year;

            let row = document.createElement('tr');
            let yearCell = document.createElement('td');
            yearCell.textContent = year;
            row.appendChild(yearCell);
            let valuationCell = document.createElement('td');
            let moneyIcon = null
            if (playerValuations[index - 1] !== undefined) {
                moneyIcon = document.createElement('img')
                moneyIcon.className = 'money-icon'
                if (valuation[1] > playerValuations[index - 1][1]) {
                    moneyIcon.setAttribute('src', 'images/price-up.svg')
                } else {
                    moneyIcon.setAttribute('src', 'images/price-down.svg')
                }
            }
            valuationCell.innerHTML =
                `<div class="valutation-and-icon">
                    <p>${valuation[1].toLocaleString()} €</p>
                    ${moneyIcon !== null ? moneyIcon.outerHTML : ''}
                </div>
                `
            row.appendChild(valuationCell);
            tableBody.appendChild(row);
        });

        if (minYear < Infinity && maxYear > -Infinity)
            titleElement.innerText = `Valutazione (Da ${minYear} a ${maxYear})`;
        else
            titleElement.innerText = "Valutazione";
    }
}


/**
 * Fetches player's last matches from the server and
 * then render it .
 */
async function fetchPlayerLastMatches() {
    const lastMatchesContainer = document.getElementById('playerLastMatches');
    const loadingSpinner = document.getElementById('loading-spinner');
    lastMatchesContainer.innerHTML = '';
    try {
        loadingSpinner.style.display = 'block';
        let playerLastMatches = await axios.get(`${MAIN_SERVER}/appearances/getPlayerGames/${playerId}`);
        playerLastMatches = playerLastMatches.data;
        if (playerLastMatches.length === 0) {
            lastMatchesContainer.innerHTML = '<h1>Nessuna partita trovata...</h1>';
        } else {
            renderPlayerMatches(playerLastMatches)
        }
    } catch (error) {
        console.error('Errore durante il recupero delle partite:', error);
    } finally { //nel blocco finally togliamo lo spinner
        loadingSpinner.style.display = 'none';
    }
}


/**
 * Renders player's last matches on the page.
 * @param {Object[]} matches - Player's last matches data.
 */
function renderPlayerMatches(matches) {
    const lastMatchesContainer = document.getElementById('playerLastMatches');
    matches.forEach(match => {
        let matchCard = renderPlayerMatch(match)
        lastMatchesContainer.appendChild(matchCard)
    })
}

/**
 * Renders a player match card.
 * @param {Object} match - Player match data.
 * @returns {HTMLElement} - HTML element representing the match card.
 */
function renderPlayerMatch(match) {
    let homeStats = {}, awayStats = {}
    const gameInfoContainer = document.createElement('div');
    gameInfoContainer.classList.add('game-information');
    gameInfoContainer.classList.add('game-information-in-player');
    //set all the necessary attributes
    gameInfoContainer.setAttribute('data-gameid', match.game_id)
    gameInfoContainer.setAttribute('data-homeclubid', match.home_club_id)
    gameInfoContainer.setAttribute('data-awayclubid', match.away_club_id)

    const roundAndDateContainer = document.createElement('div');
    roundAndDateContainer.classList.add('round-and-date-container');
    roundAndDateContainer.innerHTML = `
                    <p>${match.round}</p>
                    <p>${match.date.split('T')[0]}</p>
                `;
    gameInfoContainer.appendChild(roundAndDateContainer);

    const matchResultContainer = document.createElement('div');
    matchResultContainer.classList.add('match-result-vertical');
    if (match.player_club_id === match.home_club_id)
        homeStats = createStats(match)
    else
        awayStats = createStats(match)

    const homeTeamContainer = createTeamContainer(match.home_club_name, match.aggregate.split(':')[0], match.home_club_id, homeStats);
    matchResultContainer.appendChild(homeTeamContainer);

    const awayTeamContainer = createTeamContainer(match.away_club_name, match.aggregate.split(':')[1], match.away_club_id, awayStats);
    matchResultContainer.appendChild(awayTeamContainer);

    gameInfoContainer.appendChild(matchResultContainer);
    return gameInfoContainer
}


/**
 * Creates statistics object for a match.
 * @param {Object} game - Match data.
 * @returns {Object} - Statistics object.
 */
function createStats(game) {
    return {
        goals: game.goals,
        assists: game.assists,
        yellow_cards: game.yellow_cards,
        red_cards: game.red_cards,
        minutes_played: game.minutes_played
    }
}

/**
 * Creates a container with team information in the player last match section.
 * @param {string} teamName - Name of the team.
 * @param {number} goals - Number of goals.
 * @param {number} teamId - Team ID.
 * @param {Object} stats - Statistics object.
 * @returns {HTMLDivElement} - HTML element representing the team container.
 */
function createTeamContainer(teamName, goals, teamId, stats) {
    const teamContainer = document.createElement('div');
    const logoUrl = `${CLUB_LOGO_IMAGE_URL}${teamId}.png`;
    let goalsContainer = null, assistsContainer = null, yellowOrRedContainer = null

    teamContainer.classList.add('squad-info-row');

    const displayedTeamName = teamName || 'N.D.';
    if (Object.keys(stats).length !== 0) {//se l'oggetto stats c'è
        if (stats.goals !== 0)
            goalsContainer = renderGenericStatsContainer(stats.goals, "images/playerStatsIcons/goal-icon.svg")
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
            ${goalsContainer !== null ? goalsContainer.outerHTML : ''}
            ${assistsContainer !== null ? assistsContainer.outerHTML : ''}
            ${yellowOrRedContainer !== null ? yellowOrRedContainer.outerHTML : ''}
            <p>${goals}</p>
        `;
    return teamContainer;
}

/**
 * Renders a generic statistics container with a statistic and an icon.
 * @param {number} statistic - Statistic value.
 * @param {string} imageSrc - Source of the statistic icon.
 * @returns {HTMLDivElement} - HTML element representing the statistics container.
 */
function renderGenericStatsContainer(statistic, imageSrc) {
    let container = document.createElement('div');
    container.className = 'match-goal-icon-container';
    container.innerHTML =
        `<p>${statistic}</p>
        <img
            class="game-event-icon"
            loading="lazy"
            alt=""
            src="${imageSrc}"
        />`

    return container
}



