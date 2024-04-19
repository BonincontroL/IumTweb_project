/**
 * @ToDo Migliorare grafica e query -- Aggiungere funzionalità
 * @ToDo Pulire codice + commenti puliti
 * @ToDo Aggiungere funzionalità di ricerca --> come Possibilità di scelta squadra e/o Possibilità di scelta data precisa (calendario) xx/yy/kk
 * @ToDo migliorare selezione anno e season
 *
 * @ToDo >>>>>> FARE TEST codice
 */

document.addEventListener('DOMContentLoaded', function () {
    initLogin();
    const competitionsEndpoint = 'http://localhost:3000/competitions/getAllCompetitions';
    axios.get(competitionsEndpoint)
        .then(response => {
            const competitions = response.data;
            populateCompetitionSelect(competitions);
            attachSelectEventHandlers();
            createDayButtons();
            yearSelect();
            yearSeason();
            triggerDefaultCompetitionLoad('IT1', 'Domenica');
        })
        .catch(error => {
            console.error('Error fetching competitions:', error);
        });


});

/**
 * Aggiunge gli eventi di cambio selezione
 */
function attachSelectEventHandlers() {
    const selectElements = ['competition-select', 'year-select', 'season-select'];

    selectElements.forEach(selectId => {
        const selectElement = document.getElementById(selectId);
        selectElement.addEventListener('change', handleSelectChange);
    });
}


/**
 * Gestisce il cambio di selezione
 */
function handleSelectChange() {
    const competitionId = document.getElementById('competition-select').value;
    const dayOfWeek = document.querySelector('.date-days-picker-active')?.textContent || 'Sunday';

    fetchMatchesByCompetitionAndDay(competitionId, dayOfWeek);
}

/**
 * Popola un select con gli anni
 * @param selectId
 * @param startYear
 * @param endYear
 * @param defaultValue
 */
function populateSelectWithYears(selectId, startYear, endYear, defaultValue) {
    const selectElement = document.getElementById(selectId);
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        selectElement.appendChild(option);
    }
    selectElement.value = defaultValue;
}

/**
 * Popola il select con gli anni
 */
function yearSelect() {
    populateSelectWithYears('year-select', 2010, 2023, '2023');
}

/**
 * Popola il select con le stagioni
 */
function yearSeason() {
    populateSelectWithYears('season-select', 2010, 2023, '2023');
}

/**
 * Popola il select con le competizioni
 * @param competitions
 */
function populateCompetitionSelect(competitions) {
    const selectElement = document.getElementById('competition-select');
    selectElement.innerHTML = '';

    const groupedCompetitions = groupCompetitionsByCountry(competitions);

    Object.keys(groupedCompetitions).forEach(country => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = country;

        groupedCompetitions[country].forEach(competition => {
            const option = document.createElement('option');
            option.value = competition.competitionId;
            option.textContent = competition.name;
            optgroup.appendChild(option);
        });

        selectElement.appendChild(optgroup);
    });
}

/**
 * Raggruppa le competizioni per paese
 * @param competitions
 * @returns {*}
 */
function groupCompetitionsByCountry(competitions) {
    return competitions.reduce((acc, competition) => {
        const country = competition.countryName || "Other";
        if (!acc[country]) {
            acc[country] = [];
        }
        acc[country].push(competition);
        return acc;
    }, {});
}

/**
 * Crea i pulsanti per i giorni della settimana
 */
function createDayButtons() {
    const daysOfWeek = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

    const container = document.querySelector('.matches-header');

    daysOfWeek.forEach(day => {
        const button = document.createElement('button');
        button.textContent = day;
        button.className = 'date-days-picker';
        button.addEventListener('click', function () {
            document.querySelectorAll('.date-days-picker').forEach(btn => btn.classList.remove('date-days-picker-active'));
            button.classList.add('date-days-picker-active');
            const competitionId = document.getElementById('competition-select').value;

            fetchMatchesByCompetitionAndDay(competitionId, day);
        });
        container.appendChild(button);
    });
}

/**
 * Recupera i match per la competizione e il giorno specificati
 * @param competitionId
 * @param dayOfWeek
 */
function fetchMatchesByCompetitionAndDay(competitionId, dayOfWeek) {
    const year = document.getElementById('year-select').value;
    const season = parseInt(document.getElementById('season-select').value);
    const matchesEndpoint = `http://localhost:3001/games/getMatchesByCompetitionAndSeason/${competitionId}/${season}`;
    axios.get(matchesEndpoint)
        .then(response => {
            const matches = response.data;
            if (!matches || matches.length === 0) {
                console.error(`Error fetching matches: No matches found for season ${season} and competition ${competitionId}.`);
                const errorMessage = `Nessun match trovato per questa stagione e/o competizione.`;
                alert(errorMessage);
            }
            const matchesByRoundAndDate = filterAndGroupMatches(matches, dayOfWeek, year, season, competitionId);
            createCompetitionDiv(competitionId, matchesByRoundAndDate);
        })
        .catch(error => {
            const errorMessage = `Error fetching matches: No matches found for season ${season} and competition ${competitionId} ==> ` + error.message;
            alert(errorMessage);
            console.error(`Error fetching matches: No matches found for season ${season} and competition ${competitionId} ==> ` + error.message);
        });
}


/**
 * Filtra e raggruppa i match per round e data(anno), season e competizione
 * @param matches
 * @param dayOfWeek
 * @param year
 * @param season
 * @param competitionId
 * @returns {{}|*}
 */
function filterAndGroupMatches(matches, dayOfWeek, year, season, competitionId) {
    const daysOfWeek = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

    const filteredMatches = matches.filter(match => {
        const date = new Date(match.date);
        const matchDayOfWeek = daysOfWeek[date.getDay()];
        const matchYear = date.getFullYear();
        const matchSeason = parseInt(match.season);

        return matchDayOfWeek === dayOfWeek && matchYear.toString() === year && matchSeason === season && match.competition_id === competitionId;
    });

    if (filteredMatches.length === 0) {
        const errorMessage = `Nessun match trovato per ${dayOfWeek}, ${year}, stagione ${season} e competizione ${competitionId}.`;
        console.error(errorMessage);
        alert(errorMessage);
        return {};
    }

    const groupedMatches = filteredMatches.reduce((acc, match) => {
        const date = new Date(match.date);
        const matchDayOfWeek = daysOfWeek[date.getDay()];
        const matchYear = date.getFullYear();
        const matchSeason = parseInt(match.season);
        const round = match.round && match.round.includes('.') ? parseInt(match.round.split(".")[0]) : 'N.D.';

        const key = `${matchYear}_${matchSeason}_${round}_${matchDayOfWeek}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(match);
        return acc;
    }, {});

    return groupedMatches;
}


/**
 * Crea il div per la competizione con i match
 * @param competitionId
 * @param matchesByRoundAndDate
 */
function createCompetitionDiv(competitionId, matchesByRoundAndDate) {
    const container = document.querySelector('.matches-container');
    if (!container) {
        console.error("Matches container not found.");
        return;
    }
    container.innerHTML = '';
    Object.keys(matchesByRoundAndDate).forEach(key => {
        const [year, season, round, dayOfWeek] = key.split('_');
        const roundMatches = matchesByRoundAndDate[key];
        const roundDiv = document.createElement('div');
        roundDiv.className = 'matches-container-competition';
        roundDiv.innerHTML = `
            <div class="info-field">
                <div class="info-icon">
                    <img class="team-logo" src="https://tmssl.akamaized.net/images/logo/header/${competitionId.toLowerCase()}.png" alt="Competition Logo" />
                </div>
                <div class="leaugename_plus_matchday">
                    <p class="match-date">${formatDate(roundMatches[0].date)}</p>
                    <p><b>Round ${round}</b></p>
                    <p>Season: ${season}</p>
                </div>
            </div>
            <div class="multiple-matches-container">
                ${roundMatches.map(match => `
                    <div class="game-information" data-competitionId="${match.competition_id}" data-gameId="${match.game_id}" data-homeClubId="${match.home_club_id}" data-awayClubId="${match.away_club_id}" data-homeClubName="${match.home_club_name}" data-awayClubName="${match.away_club_name}" data-aggregate="${match.aggregate}" data-date="${match.date}" data-homeclubname="${match.home_club_name}" data-awayclubname="${match.away_club_name}" data-round="${match.round}">
                        <div class="match-result-vertical">
                            <div class="squad-icon-container">
                                <img class="squad-icon" src="https://tmssl.akamaized.net/images/wappen/head/${match.home_club_id}.png" alt="${match.home_club_name}" />
                                <p>${match.home_club_name}</p>
                                <div class="home-result">
                                    <p>${match.home_club_goals !== undefined ? match.home_club_goals : 'N.D.'}</p>
                                </div>
                            </div>
                            <div class="squad-icon-container">
                                <img class="squad-icon" src="https://tmssl.akamaized.net/images/wappen/head/${match.away_club_id}.png" alt="${match.away_club_name}" />
                                <p> ${match.away_club_name}</p>
                                <div class="away-result">
                                    <p>${match.away_club_goals !== undefined ? match.away_club_goals : 'N.D.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(roundDiv);
    });
    manageGameContainers()
}
function manageGameContainers(){
    let gameContainers= document.querySelectorAll('.game-information')
    gameContainers.forEach(game=>{
        game.addEventListener('click',()=>{
            let gameInfo={
                competitionId:game.getAttribute('data-competitionid'),
                gameId: game.getAttribute('data-gameid'),
                homeClubId: game.getAttribute('data-homeclubid'),
                awayClubId:game.getAttribute('data-awayclubid'),
                homeClubName: game.getAttribute('data-homeclubname'),
                awayClubName:game.getAttribute('data-awayclubname'),
                aggregate:game.getAttribute('data-aggregate'),
                date:game.getAttribute('data-date'),
                round:game.getAttribute('data-round')
            }
            sessionStorage.setItem('gameInfo',JSON.stringify(gameInfo))
            window.location.href='../competition_page.html?isFromMatchesPage=true'
        })
    })
}
/**
 * Imposta la competizione predefinita e il giorno predefinito
 * @param defaultCompetitionId
 * @param defaultDay
 */
function triggerDefaultCompetitionLoad(defaultCompetitionId, defaultDay) {
    const selectElement = document.getElementById('competition-select');
    selectElement.value = defaultCompetitionId;

    const defaultDayButton = Array.from(document.querySelectorAll('.date-days-picker')).find(btn => btn.textContent === defaultDay);
    defaultDayButton?.click();
}

/**
 * Formatta la data in modo leggibile
 * @param dateString
 * @returns {string}
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        weekday: 'long', // "Monday"
        year: 'numeric', // "2020"
        month: 'long', // "November"
        day: 'numeric' // "2"
    });
}

module.exports={
    manageGameContainers
}

