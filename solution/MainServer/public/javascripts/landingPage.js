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

    let competition_cards = document.querySelectorAll('.competition-card');
    setCompetitionsCardEventListener(competition_cards);

    getAndRenderPlayers();

    getAndRenderLastMatches("IT1"); // Serie A matches by default
    addCompetitionLogosListeners();
}

// ToDo  sistemare commenti + pulizia e sistemazione codice + in caso di dati mancanti mettere N.D.
// ToDo aggiungere i listeners per i bottoni delle competizioni + giocatori

/**
 * Funzione per ottenere i giocatori per una competizione specifica
 * @param competitionId
 * @returns {Promise<unknown>}
 */
function getPlayersByCompetition(competitionId) {
    const playersUrl = `http://localhost:8081/players/getPlayersByCompetition/${competitionId}`;

    return axios.get(playersUrl)
        .then(playersResponse => {
            const players = playersResponse.data;

            // Controlla se sono stati trovati giocatori
            if (players.length === 0) {
                throw new Error(`Nessun giocatore trovato per la competizione con ID: ${competitionId}`);
            }

            // Mescola i giocatori della competizione
            const shuffledPlayers = shuffleArray(players);

            // Limita i risultati ai primi 5 giocatori
            const limitedPlayers = shuffledPlayers.slice(0, 5);

            return limitedPlayers;
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
function renderPlayers(players, competitionIdentifier) {
    // Mappa l'identificatore della competizione all'indice specifico del container
    const competitionContainerMap = {
        'Serie-A': 0,
        'Premier-League': 1
    };

    // Ottiene l'indice del container basato sulla competizione
    const containerIndex = competitionContainerMap[competitionIdentifier];

    // Seleziona tutti i containers e sceglie quello specifico basato sull'indice
    const playersContainers = document.querySelectorAll('.players-container-in-homepage');
    const playersContainer = playersContainers[containerIndex];
    playersContainer.innerHTML = ''; // Pulisce il container prima di aggiungere nuovi giocatori

    // Itera su ogni giocatore e costruisce la card
    players.forEach(player => {
        const playerCard = document.createElement('button');
        playerCard.classList.add('player-card-for-homepage');
        playerCard.style.padding = '10px'; // Aggiunge spazio intorno al contenuto della card

        const competitionLogoContainer = document.createElement('div');
        competitionLogoContainer.classList.add('competition-logo-container1');

        const playerName = document.createElement('h5');
        playerName.classList.add('player-name');
        playerName.style.marginBottom = '10px'; // Aggiunge spazio sotto il nome del giocatore

        const firstName = player.firstName ? player.firstName : " ";
        const lastName = player.lastName ? player.lastName : " ";

        playerName.innerHTML = `<span style="font-weight: normal; font-size: smaller">${firstName}</span><br><span style="font-size: smaller">${lastName}</span>`;

        const squadCard = document.createElement('div');
        squadCard.classList.add('squad-card');

        const squadLogoContainer = document.createElement('div');
        squadLogoContainer.classList.add('squad-logo-container');

        const squadLogo = document.createElement('img');
        squadLogo.classList.add('squad-logo-in-starplayers');
        squadLogo.setAttribute('loading', 'eager');
        squadLogo.alt = player.teamName + ' Logo';
        squadLogo.src = `https://tmssl.akamaized.net/images/wappen/head/${player.currentClubId}.png`; // URL del logo del club
        squadLogoContainer.appendChild(squadLogo);
        squadCard.appendChild(squadLogoContainer);

        const teamName = document.createElement('h5');
        teamName.classList.add('team-name');
        teamName.style.fontWeight = 'normal';
        teamName.style.fontStyle = 'italic';
        teamName.textContent = player.currentClubName;
        squadCard.appendChild(teamName);

        competitionLogoContainer.appendChild(playerName);
        competitionLogoContainer.appendChild(squadCard);
        playerCard.appendChild(competitionLogoContainer);

        const playerImage = document.createElement('img');
        playerImage.classList.add('squad-info-frame', 'rounded-image');
        playerImage.style.borderRadius = '50%'; // Rende l'immagine del giocatore arrotondata
        playerImage.setAttribute('loading', 'eager');
        playerImage.alt = player.firstName + ' ' + player.lastName + ' image';
        playerImage.src = player.imageUrl;
        playerImage.style.marginRight='25px';
        playerCard.appendChild(playerImage);

        /**
         * Aggiunge il numero del giocatore alla card del giocatore.
         */
        getPlayerNumber(player.playerId)
            .then(playerNumber => {

                if (playerNumber !== null) {
                    const playerNumberValue = playerNumber.playerNumber;
                    const playerNumberContainer = document.createElement('div');
                    playerNumberContainer.classList.add('player-number-container');
                    const playerNumberElement = document.createElement('h5');
                    playerNumberElement.textContent = playerNumberValue !== -1 ? String(playerNumberValue) : 'N.D.';

                    playerNumberContainer.appendChild(playerNumberElement);
                    playerCard.appendChild(playerNumberContainer);
                }
            })
            .catch(error => {
                console.error('Errore durante il recupero del numero del giocatore:', error);
            });


        playersContainer.appendChild(playerCard);
    });

}

/**
 * Ottiene i giocatori da una competizione specifica e li renderizza utilizzando la mappa identificatore-container.
 */
function getAndRenderPlayers() {
    getPlayersByCompetition("IT1").then(players => {
        renderPlayers(players, 'Serie-A');
    }).catch(error => {
        console.error('Errore durante il recupero dei giocatori della Serie A:', error);
    });

    getPlayersByCompetition("GB1").then(players => {
        renderPlayers(players, 'Premier-League');
    }).catch(error => {
        console.error('Errore durante il recupero dei giocatori della Premier League:', error);
    });
}

/**
 * Funzione per mescolare un array
 * @param array
 * @returns {*}
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Funzione per ottenere il numero di maglia di un giocatore
 * @param idPlayer
 * @returns {Promise<unknown>}
 */
function getPlayerNumber(idPlayer) {
    const playerNumberUrl = `http://localhost:3001/gamelineups/getPlayerNumberByIdPlayer/${idPlayer}`;

    return axios.get(playerNumberUrl)
        .then(playerNumberResponse => {
            const playerNumber = playerNumberResponse.data;

            return playerNumber;
        })
        .catch(error => {
            console.error('Errore durante il recupero del numero di maglia del giocatore:', error);
            throw error;
        });
}


/**
 * Recupera gli ultimi match di una specifica competizione utilizzando il competition_id.
 * @param {string} competitionId - L'identificativo della competizione (ad esempio, 'IT1' per la Serie A).
 * @returns {Promise<Array>} Un promise che, se risolto, restituisce un array dei match.
 */
function getLastMatchesByCompetition(competitionId) {
    const matchesUrl = `http://localhost:3001/games/getLastMatchesByCompetition/${competitionId}`;

    return axios.get(matchesUrl)
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
    }).catch(error => {
        console.error(`Errore durante il recupero dei match della ${competitionId}:`, error);
    });
}

/**
 * Funzione per renderizzare i match (games) in container specifico.
 * @param matches
 */
function renderMatches(matches) {
    const matchesContainer = document.querySelector('.multiple-matches-container');
    matchesContainer.innerHTML = '';

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
            name: match.home_club_name,
            logo: `https://tmssl.akamaized.net/images/wappen/head/${match.home_club_id}.png`,
            score: match.home_club_goals
        },
        awayTeam: {
            name: match.away_club_name,
            logo: `https://tmssl.akamaized.net/images/wappen/head/${match.away_club_id}.png`,
            score: match.away_club_goals
        },
        time: new Date(match.date).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
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
    matchDiv.classList.add('game-information');

    const homeTeamLogo = `<img class="team-logo" src="${match.homeTeam.logo}" alt="${match.homeTeam.name}" />`;
    const awayTeamLogo = `<img class="team-logo" src="${match.awayTeam.logo}" alt="${match.awayTeam.name}" />`;

    const homeTeamNameStyle = match.homeTeam.name && match.homeTeam.name.length > 20 ? 'font-size: 0.8rem; text-align:center;' : '';
    const awayTeamNameStyle = match.awayTeam.name && match.awayTeam.name.length > 20 ? 'font-size: 0.8rem; text-align:center;' : '';

    const matchResultVertical = `
        <div class="match-result-vertical">
            <div class="squad-icon-container">
                ${homeTeamLogo}
                <p style="${homeTeamNameStyle}">${match.homeTeam.name || 'N.D.'}</p>
                <div class="team-result">
                    <p>${match.homeTeam.score !== undefined ? match.homeTeam.score :'N.D.'}</p>
                </div>
            </div>
            <div class="squad-icon-container">
                ${awayTeamLogo}
                <p style="${awayTeamNameStyle}">${match.awayTeam.name || 'N.D.'}</p>
                <div class="team-result">
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