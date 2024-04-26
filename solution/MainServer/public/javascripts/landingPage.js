const LAST_SEASON=2023
function init() {
    let swiper = new Swiper(".competition-swiper", {
        slidesPerView: 1,
        direction: "horizontal",
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        }
    })
    document.getElementById('goToAllCompetitions').addEventListener('click', () => {
        window.location.href = "../searchCompetition_page.html"
    })

    let competition_cards = document.querySelectorAll('.competition-card');
    setCompetitionsCardEventListener(competition_cards);
    getAndRenderPlayers();
    getAndRenderLastMatches("IT1"); // Serie A matches by default
    getAndRenderLastMatches("NL1");
    addCompetitionLogosListeners();
    initLogin();

}

//test di prova per getAndRenderLastMatches in home page --> da rivedere lo stile
// ToDo  sistemare commenti + pulizia e sistemazione codice


/**
 * Funzione per ottenere i giocatori per una competizione specifica
 * @param competitionId
 * @returns {Promise<unknown>}
 */
function getPlayersByCompetition(competitionId) {
    const url = `http://localhost:3000/players/get5RandomPlayersByCompIdAndLastSeason/${competitionId}/${LAST_SEASON}`;
    return axios.get(url)
        .then(playersResponse => {
            const players = playersResponse.data;
            // Controlla se sono stati trovati giocatori
            if (players.length === 0) {
                throw new Error(`Nessun giocatore trovato per la competizione con ID: ${competitionId}`);
            }else
                return players;
        })
        .catch(error => {
            console.error('Errore durante il recupero dei dati:', error);
            throw error;
        });
}

/**
 * Funzione unificata per renderizzare i giocatori in un container specifico basato sulla competizione.
 * @param {Array} players - Array di giocatori da renderizzare.
 * @param {String} competitionIdentifier - competizione.
 */
async function renderPlayers(players, competitionIdentifier) {
    // Mappa l'identificatore della competizione all'indice specifico del container
    const competitionContainerMap = {
        'Serie-A': 0,
        'Premier-League': 1,
        'La-Liga': 2,
        'Bundesliga': 3,
        'Ligue-1': 4
    };

    // Ottiene l'indice del container basato sulla competizione
    const containerIndex = competitionContainerMap[competitionIdentifier];

    // Seleziona tutti i containers e sceglie quello specifico basato sull'indice
    const playersContainers = document.querySelectorAll('.players-container-in-homepage');
    const playersContainer = playersContainers[containerIndex];
    playersContainer.innerHTML = ''; // Pulisce il container prima di aggiungere nuovi giocatori

    // Itera su ogni giocatore e costruisce la card
    for (const player of players) {
        let playerCard = renderPlayerCard(player)

        /**
         * Aggiunge il numero del giocatore alla card del giocatore.
         */
        try {
            let playerNumber = await getPlayerNumber(player.playerId)
            if (playerNumber.data !== null) {
                playerCard.appendChild(renderPlayerNumber(playerNumber.data.playerNumber));
            }
        } catch (e) {
            alert(e)
            console.error('Errore durante il recupero del numero del giocatore:', error);
        }
        playersContainer.appendChild(playerCard);
    }

}
function renderPlayerCard(player){
    const playerCard = document.createElement('button');
    playerCard.setAttribute('data-playerid', player.playerId)
    playerCard.setAttribute('data-imageurl', player.imageUrl)
    playerCard.setAttribute('data-name', player.name)

    playerCard.classList.add('player-card-for-homepage');

    const competitionLogoContainer = document.createElement('div');
    competitionLogoContainer.classList.add('competition-logo-container1');

    const playerName = document.createElement('h5');
    playerName.classList.add('player-name');

    const firstName = player.firstName ? player.firstName : " ";
    const lastName = player.lastName ? player.lastName : " ";

    playerName.innerHTML = `<span style="font-weight: normal; font-size: smaller">${firstName}</span><br><span style="font-size: smaller">${lastName}</span>`;

    const squadCard = document.createElement('div');
    squadCard.classList.add('squad-card');

    const squadLogo = document.createElement('img');
    squadLogo.classList.add('squad-logo-in-starplayers');
    squadLogo.setAttribute('loading', 'eager');
    squadLogo.alt = player.teamName + ' Logo';
    squadLogo.src = `https://tmssl.akamaized.net/images/wappen/head/${player.currentClubId}.png`; // URL del logo del club
    squadCard.appendChild(squadLogo);

    const teamName = document.createElement('h5');
    teamName.classList.add('team-name');
    teamName.textContent = player.currentClubName;
    squadCard.appendChild(teamName);
    competitionLogoContainer.appendChild(playerName);
    competitionLogoContainer.appendChild(squadCard);

    const playerImage = document.createElement('img');
    playerImage.classList.add('squad-info-frame');
    playerImage.alt = player.firstName + ' ' + player.lastName + ' image';
    playerImage.src = player.imageUrl;
    playerCard.appendChild(playerImage);

    playerCard.appendChild(competitionLogoContainer);

    return playerCard
}
function renderPlayerNumber(playerNumber){
    const playerNumberContainer = document.createElement('div');
    playerNumberContainer.classList.add('player-number-container');
    const playerNumberElement = document.createElement('h5');
    playerNumberElement.textContent = playerNumber !== -1 ? String(playerNumber) : 'N.D.';
    playerNumberContainer.appendChild(playerNumberElement);

    return playerNumberContainer
}
/**
 * Ottiene i giocatori da una competizione specifica e li renderizza utilizzando la mappa identificatore-container.
 */
function getAndRenderPlayers() {
    Promise.all([
        getPlayersByCompetition('IT1'),
        getPlayersByCompetition('GB1'),
        getPlayersByCompetition('ES1'),
        getPlayersByCompetition('L1'),
        getPlayersByCompetition('FR1'),
    ]).then(async res => {
        await renderPlayers(res[0], 'Serie-A')
        await renderPlayers(res[1], 'Premier-League')
        await renderPlayers(res[2], 'La-Liga')
        await renderPlayers(res[3], 'Bundesliga')
        await renderPlayers(res[4], 'Ligue-1')

        let playerCards = document.querySelectorAll('.players-container-in-homepage > .player-card-for-homepage')
        setPlayersEventListener(playerCards) //imposto i listener per far si che quando l'utente clicca si vada sulla pagina del giocatore
    }).catch(error => {
        console.error('Errore durante il recupero dei giocatori della Premier League:', error);
    });
}


/**
 * Funzione per ottenere il numero di maglia di un giocatore
 * @param idPlayer
 * @returns {Promise<unknown>}
 */
function getPlayerNumber(idPlayer) {
    //const playerNumberUrl = `http://localhost:3001/gamelineups/getPlayerNumberByIdPlayer/${idPlayer}`;
    const url=`http://localhost:3000/gamelineups/getPlayerNumberByIdPlayer/${idPlayer}`;
    return axios.get(url)
}


/**
 * Recupera gli ultimi match di una specifica competizione utilizzando il competition_id.
 * @param {string} competitionId - L'identificativo della competizione (ad esempio, 'IT1' per la Serie A).
 * @returns {Promise<Array>} Un promise che, se risolto, restituisce un array dei match.
 */
function getLastMatchesByCompetition(competitionId) {
    const url=`http://localhost:3000/games/getLastMatchesByCompetition/${competitionId}`;
    return axios.get(url)
        .then(matchesResponse => {
            const matches = matchesResponse.data;
            if (matches.length === 0) {
                throw new Error(`Nessun match trovato per la competizione con ID: ${competitionId}.`);
            }
            return matches;
        })
        .catch(error => {
            console.error('Errore durante il recupero dei dati per la competizione con ID:', competitionId, error);
            throw error;
        });
}

/**
 * Funzione per ottenere e renderizzare gli ultimi match (games) di una competizione specifica.
 * @param competitionId
 */
function getAndRenderLastMatches(competitionId) {
    getLastMatchesByCompetition(competitionId).then(matches => {
        renderMatches(matches, competitionId);
        let matchCards = document.querySelectorAll('.multiple-matches-container >.game-information')
        setMatchesCardEventListener(matchCards)
    }).catch(error => {
        console.error(`Errore durante il recupero dei match della ${competitionId}:`, error);
    });
}

/**
 * Funzione per renderizzare i match (games) in container specifico.
 * @param matches
 * @param competitionId
 */
function renderMatches(matches, competitionId) {
    const secondContainerCompetitionIds = ['EL', 'POSU', 'NL1', 'BE1', 'CLQ'];
    let matchesContainer;
    if (secondContainerCompetitionIds.includes(competitionId)) {
        matchesContainer = document.querySelectorAll('.multiple-matches-container')[1];
    } else {
        matchesContainer = document.querySelector('.multiple-matches-container');
    }

    matchesContainer.innerHTML = '';

    // Itera su ogni match e li aggiunge al container selezionato
    matches.forEach(matchData => {
        const adaptedMatch = adaptMatchData(matchData);
        const matchDiv = createMatchDiv(adaptedMatch);
        matchesContainer.appendChild(matchDiv);
    });
}

/**
 * Funzione per adattare i dati del match (game) in un formato più leggibile.
 * @param match
 * @returns {{_id: *, game_id: *, competition_id: *, season: *, round: *, homeTeam: {name: *, logo: string, score: *}, awayTeam: {name: *, logo: string, score: *}, time: string}}
 */
function adaptMatchData(match) {
    return {
        _id: match._id,
        game_id: match.game_id,
        competition_id: match.competition_id,
        season: match.season,
        round: match.round,
        homeTeam: {
            id:match.home_club_id,
            name: match.home_club_name,
            logo: `https://tmssl.akamaized.net/images/wappen/head/${match.home_club_id}.png`,
            score: match.home_club_goals
        },
        awayTeam: {
            id:match.away_club_id,
            name: match.away_club_name,
            logo: `https://tmssl.akamaized.net/images/wappen/head/${match.away_club_id}.png`,
            score: match.away_club_goals
        },
        time: new Date(match.date).toLocaleString([], {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    };
}

/**
 * Funzione per creare un div per un match (game) specifico.
 * @param match
 * @returns {HTMLDivElement}
 */
function createMatchDiv(match) {
    const matchDiv = document.createElement('div');
    matchDiv.setAttribute('data-gameId',match.game_id)
    matchDiv.setAttribute('data-homeclubid',match.homeTeam.id)
    matchDiv.setAttribute('data-awayclubid',match.awayTeam.id)
    matchDiv.setAttribute('data-homeclubname',match.homeTeam.name)
    matchDiv.setAttribute('data-awayclubname',match.awayTeam.name)
    matchDiv.setAttribute('data-aggregate',`${match.homeTeam.score}-${match.awayTeam.score}`)
    matchDiv.setAttribute('data-date',match.time)
    matchDiv.setAttribute('data-competitionid',match.competition_id)
    matchDiv.setAttribute('data-round',match.round)

    matchDiv.classList.add('game-information');

    const homeTeamLogo = `<img class="squad-icon" src="${match.homeTeam.logo}" alt="${match.homeTeam.name} logo" />`;
    const awayTeamLogo = `<img class="squad-icon" src="${match.awayTeam.logo}" alt="${match.awayTeam.name} logo" />`;

    const matchResultVertical = `
        <div class="match-result-vertical">
            <div class="squad-icon-container">
                ${homeTeamLogo}
                <p>${match.homeTeam.name || 'N.D.'}</p>
                <div class="home-result">
                    <p>${match.homeTeam.score !== undefined ? match.homeTeam.score :'N.D.'}</p>
                </div>
            </div>
            <div class="squad-icon-container">
                ${awayTeamLogo}
                <p>${match.awayTeam.name || 'N.D.'}</p>
                <div class="away-result">
                    <p>${match.awayTeam.score !== undefined ? match.awayTeam.score : 'N.D.'}</p>
                </div>
            </div>
        </div>
    `;

    matchDiv.innerHTML = matchResultVertical;
    return matchDiv;
}

/**
 * Aggiunge un listener a tutti i loghi delle competizioni
 */
function addCompetitionLogosListeners() {
    const logos = document.querySelectorAll('.competition-logos-container [data-competition-id]');
    logos.forEach(logo => {
        logo.addEventListener('click', function() {
            const competitionId = logo.getAttribute('data-competition-id');
            getAndRenderLastMatches(competitionId);
        });
    });
}



