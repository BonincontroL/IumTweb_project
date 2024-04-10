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

    let competition_cards = document.querySelectorAll('.competition-card')
    competition_cards.forEach(card => {
        card.addEventListener('click', () => {
            let competition_id = card.getAttribute('data-competitionId')
            window.location.href = "../competition_page.html?competition_id=" + competition_id
        })
    })

    getAndRenderPlayers();
}

// ToDo sistemare funzioni + commenti + pulizia codice + mettere numero maglia giocatore
// ToDo  il renderPlayers homepage si può unire in un'unica funzione + migliorare render controllare classi css
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
 * Funzione per renderizzare i giocatori per la Serie A
 * @param players
 */
function renderPlayersSeriaA(players) {
    const playersContainer = document.querySelector('.players-container-in-homepage');
    playersContainer.innerHTML = '';

    players.forEach(player => {
        const playerCard = document.createElement('button');
        playerCard.classList.add('player-card-for-homepage');

        const competitionLogoContainer = document.createElement('div');
        competitionLogoContainer.classList.add('competition-logo-container1');

        const playerName = document.createElement('h5');
        playerName.classList.add('player-name');
        playerName.innerHTML = `<span style="font-weight: normal; font-size: smaller">${player.firstName}</span><br><span style="font-size: smaller">${player.lastName}</span>`;

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
        teamName.textContent = player.currentClubName;
        squadCard.appendChild(teamName);
        competitionLogoContainer.appendChild(playerName);
        competitionLogoContainer.appendChild(squadCard);
        playerCard.appendChild(competitionLogoContainer);

        const playerImage = document.createElement('img');
        playerImage.classList.add('squad-info-frame');
        playerImage.classList.add('rounded-image');
        playerImage.setAttribute('loading', 'eager');
        playerImage.alt = player.firstName + ' ' + player.lastName + ' image';
        playerImage.src = player.imageUrl;
        playerCard.appendChild(playerImage);

        playersContainer.appendChild(playerCard);
    });
}

/**
 * Funzione per renderizzare i giocatori per la Premier League
 * @param players
 */
function renderPlayersPremierLeauge(players) {
    const playersContainers = document.querySelectorAll('.players-container-in-homepage');
    const secondPlayersContainer = playersContainers[1]; // Secondo elemento con la classe 'players-container-in-homepage' è per la Premier League

    secondPlayersContainer.innerHTML = '';

    players.forEach(player => {
        const playerCard = document.createElement('button');
        playerCard.classList.add('player-card-for-homepage');

        const competitionLogoContainer = document.createElement('div');
        competitionLogoContainer.classList.add('competition-logo-container1');

        const playerName = document.createElement('h5');
        playerName.classList.add('player-name');
        playerName.innerHTML = `<span style="font-weight: normal; font-size: smaller">${player.firstName}</span><br><span style="font-size: smaller">${player.lastName}</span>`;

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
        teamName.textContent = player.currentClubName;
        squadCard.appendChild(teamName);
        competitionLogoContainer.appendChild(playerName);
        competitionLogoContainer.appendChild(squadCard);
        playerCard.appendChild(competitionLogoContainer);

        const playerImage = document.createElement('img');
        playerImage.classList.add('squad-info-frame');
        playerImage.classList.add('rounded-image');
        playerImage.setAttribute('loading', 'eager');
        playerImage.alt = player.firstName + ' ' + player.lastName + ' image';
        playerImage.src = player.imageUrl;
        playerCard.appendChild(playerImage);

        secondPlayersContainer.appendChild(playerCard);
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
 * Funzione per ottenere e renderizzare i giocatori
 */
function getAndRenderPlayers() {

    getPlayersByCompetition("IT1").then(players => {
        renderPlayersSeriaA(players);
    }).catch(error => {
        console.error(error);
    });

    getPlayersByCompetition("GB1").then(players => {
        renderPlayersPremierLeauge(players);
    }).catch(error => {
        console.error(error);
    });

}