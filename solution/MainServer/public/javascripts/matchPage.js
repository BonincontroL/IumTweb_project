//javascript dedicato alla gestione di un singolo match
let matchInfo //=> Object containing information about the match.
let matchButtons //=> Match buttons.
let playerDefaultImageUrl = "https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1" //=> Default image URL for players without information.
let currentHomeGoals = 0, currentAwayGoals = 0 //=> Current number of goals scored by the home team. - Current number of goals scored by the away team.
let homeGoalEvents, awayGoalEvents//=>array usati per renderizzare le colonne dei goal nel banner superiore
let isHeadToHeadLoaded =false, isFormationsLoaded=false
const TIME_MINUTES = 45 //=> Number of minutes in a football match.
const CAPITAIN_SYMBOL='(C)'
const MAIN_POSITIONS={
    GOALKEEPER:"Goalkeeper",
    DEFENDER:"Defender",
    ATTACK:"Attack",
    MIDFIELD: "Midfield"
}
const NO_GOALS_AGGREGATE='0:0'
const EVENT_TYPES={
    SUBSTITUTION:"Substitutions",
    GOALS:"Goals",
    CARDS:"Cards",
}
document.addEventListener('DOMContentLoaded', async () => {
    matchInfo = JSON.parse(sessionStorage.getItem('gameInfo'))
    let matchIds = {
        game_id: matchInfo.game_id,
        home_club_id: matchInfo.home_club_id,
        away_club_id: matchInfo.away_club_id
    }
    manageEventDelegation()
    manageMatchButtons()
    await getMatchInformation()
    getMatchEvents(matchIds)
    document.getElementById('getMatchFormation').addEventListener('click',async () => {
        if (!isFormationsLoaded)
            await getMatchFormation(matchIds)
    })
    document.getElementById('getHeadToHead').addEventListener('click',()=>{
        if(!isHeadToHeadLoaded)
            getHeadToHeadInfos()
    })
    initLogin();
})
function getHeadToHeadInfos(){
    let url="http://localhost:3000/games/getHeadToHead"
    axios.get(url,{
        params:{
            homeClubId: matchInfo.home_club_id,
            awayClubId: matchInfo.away_club_id,
        }
    }).then(res=>{
        renderHeadToHeadInfos(res.data[0])
        isHeadToHeadLoaded=true
    }).catch(err=>{
        alert(err)
    })
}
function renderHeadToHeadInfos(infos){
    const totalMatches =infos.homeWins+infos.awayWins+infos.draws
    document.getElementById('homeLogo').setAttribute('src',`${CLUB_LOGO_IMAGE_URL}${matchInfo.home_club_id}.png`)
    document.getElementById('awayLogo').setAttribute('src',`${CLUB_LOGO_IMAGE_URL}${matchInfo.away_club_id}.png`)

    renderGraph('homeWinsCanvas',infos.homeWins,totalMatches,'Vittorie '+infos.homeWins)
    renderGraph('drawCanvas',infos.draws,totalMatches,'Pareggi '+infos.draws)
    renderGraph('awayWinsCanvas',infos.awayWins,totalMatches,'Vittorie '+infos.awayWins)
}
function renderGraph(graphId,info,totalMatch,labelText){
    const graph=document.getElementById(graphId).getContext('2d')
    const doughnutLabel=createChartLabel(labelText)
    const squadChart= new Chart(graph,{
        type:'doughnut',
        data:{
            datasets:[{
                data:[info,totalMatch],
                backgroundColor:[
                    getComputedStyle(document.body).getPropertyValue('--primary-blue-900'),
                    getComputedStyle(document.body).getPropertyValue('--white')
                ]
            }]
        },
        options:{
            responsive:true,
            borderRadius:12,
            animation: {
                animateScale: true,
                animateRotate: true
            },
            plugins: {
                tooltip:{
                    enabled:true,
                    borderWidth:0
                }
            }
        },
        plugins:[
            doughnutLabel
        ]
    })
}
function createChartLabel(labelText){
    return {
        id:'doughnutLabel',
        beforeDatasetDraw(chart,args,pluginOptions){
            const {ctx,data}=chart
            ctx.save()
            const xCoor=chart.getDatasetMeta(0).data[0].x
            const yCoor=chart.getDatasetMeta(0).data[0].y
            ctx.font= 'bold 18px sans-serif';
            ctx.textAlign='center'
            ctx.textBaseline ='middle'
            ctx.fillText(labelText,xCoor,yCoor)
        }
    }
}
/**
 * Renders information on the match banner.
 */
function renderBannerInfo() {
    //renderizza le informazioni del banner del match
    document.getElementById('homeClubName').innerText = !matchInfo.home_club_name  ? 'N.D' : matchInfo.home_club_name
    document.getElementById('awayClubName').innerText = !matchInfo.away_club_name  ? 'N.D' : matchInfo.away_club_name
    document.getElementById('homeClubLogo').setAttribute('src', CLUB_LOGO_IMAGE_URL + matchInfo.home_club_id + ".png")
    document.getElementById('awayClubLogo').setAttribute('src', CLUB_LOGO_IMAGE_URL + matchInfo.away_club_id + ".png")
    document.getElementById('aggregate').innerText = matchInfo.aggregate
    //aggiungi la data
    document.getElementById('match-details-date').innerText = matchInfo.date.split('T')[0]
}

/**
 * Retrieves match events from the server.
 * @param {Object} matchIds - Object containing match IDs.
 */
function getMatchEvents(matchIds) {
    axios.get("http://localhost:3000/gameevents/getMatchEvents", {
        params: {
            game_id: matchIds.game_id
        }
    }).then(res => {
        renderMatchEvents(res.data, +matchIds.home_club_id, +matchIds.away_club_id, matchInfo.aggregate) //il + serve per convertire le stringhe in numeri
        if (matchInfo.aggregate!== NO_GOALS_AGGREGATE)
            renderGoalsRow()
        else
            document.getElementById('goalsRowContainer').style.display = 'none'
    }).catch(err => {
        alert(err)
    })
}

/**
 * Renders match events on the page.
 * @param {Object[]} events - Array of match events.
 * @param {number} homeClubId - ID of the home club.
 * @param {number} awayClubId - ID of the away club.
 * @param {string} finalResult - Final result of the match.
 */
function renderMatchEvents(events, homeClubId, awayClubId, finalResult) {
    let eventsContainer = document.getElementById('match-details-events')
    let isFirstHalfBannerRendered = false
    homeGoalEvents = []
    awayGoalEvents = []
    currentHomeGoals = +finalResult.split(':')[0]
    currentAwayGoals = +finalResult.split(':')[1]
    eventsContainer.innerHTML = ''
    //aggiungiamo il banner per il risultato finale.
    eventsContainer.appendChild(renderResultBanner(finalResult, "Partita finita"))
    //aggiungiamo tutti gli altri eventi
    events.forEach((event, index, arr) => {
        let eventDiv = renderEvent(event, homeClubId, awayClubId)
        eventsContainer.appendChild(eventDiv)
        //controlliamo il banner del primo tempo
        if (index + 1 < arr.length && !isFirstHalfBannerRendered) {
            let nextEvent = arr[index + 1]
            if (nextEvent.minute < TIME_MINUTES) {
                eventsContainer.appendChild(renderResultBanner(`${currentHomeGoals}:${currentAwayGoals}`, "Fine primo tempo"))
                isFirstHalfBannerRendered = true
            } //se il prossimo evento si trova nel secondo tempo
        }
    })

}

/**
 * function that render the goals row in the match banner
 * there are two columns, home and away goals, and for each row
 * there is who scored and the goal/goals minute when he scored
 */
function renderGoalsRow() {
    const homeGoalsColumnContainer = document.querySelector(".match-details-squadGoals-column-left")
    const awayGoalsColumnContainer = document.querySelector(".match-details-squadGoals-column-right")
    homeGoalsColumnContainer.innerHTML = ''
    awayGoalsColumnContainer.innerHTML = ''
    renderGoalsColumn(homeGoalsColumnContainer, homeGoalEvents)
    renderGoalsColumn(awayGoalsColumnContainer, awayGoalEvents)
}

/**
 * function that render a single goal column in the match banner
 * @param columnContainer the goal column container
 * @param goalEvents a "hash map" where each player is associated to the goals scored
 */
function renderGoalsColumn(columnContainer, goalEvents) {
    goalEvents = goalEvents.reduce((acc, goal) => {
        if (!acc[goal.player]) {
            acc[goal.player] = []
        }
        acc[goal.player].push(goal)
        return acc
    }, {})
    Object.keys(goalEvents).forEach(player => {
        let playerGoalContainer = document.createElement('p')
        let minutes = goalEvents[player].map(goal => goal.minute + '°').join(', ')
        playerGoalContainer.innerText = `${player} ${minutes}`
        columnContainer.appendChild(playerGoalContainer)
    })
}

/**
 * function that render the partial or final result in the match events page
 * @param result the final or partial result of the match
 * @param phrase the phrase to put in the banner
 * @returns {HTMLDivElement}
 */
function renderResultBanner(result, phrase) {
    let resultBanner = document.createElement('div')
    resultBanner.className = 'match-partial-result-container';
    resultBanner.innerHTML =
        `<h6>${phrase}</h6>
         <h6>${result}</h6>`
    return resultBanner
}

/**
 * function that render a single game event in the correct position,
 * there are three types of game events: Goals, Cards and Substitution
 * @param event the object which represent an event
 * @param homeClubId
 * @param awayClubId
 * @returns {HTMLDivElement}
 */
function renderEvent(event, homeClubId, awayClubId) {
    let eventDiv = document.createElement('div')
    let eventLogo = document.createElement('img')
    eventLogo.className = 'game-event-icon'
    let minutesContainer = document.createElement('p')
    minutesContainer.innerText = event.minute + '°'
    let containers = [eventLogo, minutesContainer]
    switch (event.type) {
        case EVENT_TYPES.SUBSTITUTION: {
            eventLogo.setAttribute('src', 'images/gameeventsLogos/substitution-icon.svg');
            let playerInContainer = document.createElement('h6')
            playerInContainer.innerHTML = `Entra: <b>${event.substitute}</b>`//bisogna trovare il modo per ottenere il nome del giocatore
            let playerOutContainer = document.createElement('h6')
            playerOutContainer.innerHTML = `Esce: <b>${event.player}</b>`
            containers.push(playerInContainer, playerOutContainer)
            break
        }
        case EVENT_TYPES.GOALS:
            let assistPhrase = 'Assist:'
            if (event.description.search('Penalty') !== -1) {
                eventLogo.setAttribute('src', 'images/gameeventsLogos/penaltyScored-icon.svg');
                assistPhrase = 'Rigore procurato da:'
            } else if (event.description.search('Own-goal') !== -1)
                eventLogo.setAttribute('src', 'images/gameeventsLogos/owngoal-icon.svg');
            else {
                eventLogo.setAttribute('src', 'images/gameeventsLogos/goal-icon.svg');
            }
            let partialResultContainer = document.createElement('h6')
            partialResultContainer.innerHTML = `${currentHomeGoals}-${currentAwayGoals}`
            containers.push(partialResultContainer)
            if (event.club_id === homeClubId) {
                currentHomeGoals--
                homeGoalEvents.push(event)
            } else {
                currentAwayGoals--
                awayGoalEvents.push(event)
            }
            let scorerContainer = document.createElement('h6')
            scorerContainer.innerHTML = `<b>${event.player}</b>`
            containers.push(scorerContainer)
            if (event.assist) {
                let assistmanContainer = document.createElement('h6')
                assistmanContainer.innerHTML = `${assistPhrase}<b>${event.assist}</b>`
                containers.push(assistmanContainer)
            }
            break;
        case EVENT_TYPES.CARDS:
            if ((event.description.search('Red') !== -1) || (event.description.search('Second') !== -1)) //modo per capire se un cartellino è rosso, potrebbe essere migliorato.
                eventLogo.setAttribute('src', 'images/gameeventsLogos/red-icon.svg')
            else if (event.description.search('Yellow') !== -1) //potrebbe essere migliorato,
                eventLogo.setAttribute('src', 'images/gameeventsLogos/yellow-icon.svg')
            let playercardContainer = document.createElement('h6')
            playercardContainer.innerHTML = `<b>${event.player}</b>`
            containers.push(playercardContainer)
            break;
    }
    if (event.club_id === homeClubId)
        eventDiv.className = 'home-game-event';
    else if (event.club_id === awayClubId) {
        eventDiv.className = 'away-game-event'
        containers.reverse()
    }
    containers.forEach(container => {
        eventDiv.appendChild(container)
    })
    return eventDiv;
}

/**
 * get some match information like refree,stadium, home club manager and away club manager
 * @param gameId the identifier of the game
 */
async function getMatchInformation() {
    try {
        let info = await getGameInfos()
        matchInfo = info.data;
        let compName = await getCompetitionName();
        renderBannerInfo()
        renderMatchInformation(compName.data)
    } catch (err) {
        alert(err)
    }
}

function renderMatchInformation(competitionName) {
    document.getElementById('match-details-refree').innerText = matchInfo.referee
    document.getElementById('match-details-stadium').innerText = matchInfo.stadium
    document.getElementById('match-details-competition').innerText=competitionName
    let competitionCard =document.getElementById('competitionCard')
    competitionCard.setAttribute('data-competitionId', matchInfo.competition_id)
    competitionCard.setAttribute('data-competitionName', competitionName)
    document.getElementById('match-details-competitionImg').setAttribute('src', `${COMPETITION_LOGO_IMAGE_URL}${matchInfo.competition_id.toLowerCase()}.png`)
}

function getCompetitionName() {
    let url = "http://localhost:3000/competitions/getName";
    return axios.get(url, {
        params: {
            competition_id: matchInfo.competition_id
        }
    })
}

function getGameInfos() {
    let url = "http://localhost:3000/games/get";
    return axios.get(url, {
        params: {
            game_id: matchInfo.game_id
        }
    })
}

/**
 * this function is used to switch to the correct container into the single match page
 * it's also used to manage the correct active class of the button
 */
function manageMatchButtons() {
    matchButtons = document.querySelectorAll('.match-details-navbar > button')
    matchButtons.forEach(button => {
        button.addEventListener('click', () => {
            let containerName = button.getAttribute('data-showContainer')
            let containerToShow = document.getElementById(containerName)
            hideMatchContainersExceptOne(containerToShow)
            //ora rendiamo il bottone l'unico "attivo"
            matchButtons.forEach(btn => {
                btn.classList.remove('button-game-navbar-active')
            })
            button.classList.add('button-game-navbar-active')
        })
    })
}

function hideMatchContainersExceptOne(containerToShow) {
    let matchContainers = document.querySelectorAll('#match-details-container > div')
    matchContainers.forEach(container => {
        container.style.display = "none"
    })
    containerToShow.style.display = "flex"
}

/**
 * get the home and away clubs formation, which includes the starting players
 * and substitutes (which are player that start the game in the bench)
 * @param matchIds query parameter, is an object formed by game_id, home_club_id and away_club_id
 */
async function getMatchFormation(matchIds) {
    try {
        let res = await getMatchPlayers(matchIds)
        if (res.data[0].home_lineup.length === 0 && res.data[0].away_lineup.length === 0)
            document.getElementById('formationNotFoundContainer').style.display = 'flex'
        else {
            let homeLineup = res.data[0].home_lineup[0].lineup
            let awayLineup = res.data[0].away_lineup[0].lineup
            await renderMatchFormation(homeLineup, awayLineup)
        }
        isFormationsLoaded = true
    } catch (err) {
        alert(err);
    }
}
function getMatchPlayers(matchIds){
    let url = "http://localhost:3000/gamelineups/getMatchPlayers";
    return axios.get(url, {params: matchIds})
}
/**
 * this function render the home lineup and away lineup of a specific game,
 * @param homeLineup an object array of all the home team players that have played the game
 * @param awayLineup an object array of all the away team players that have played the game
 */
async function renderMatchFormation(homeLineup, awayLineup) {
    let homeLineupContainer = document.getElementById('homeFormationContainer')
    homeLineupContainer.innerHTML = ''
    let awayLineupContainer = document.getElementById('awayFormationContainer')
    awayLineupContainer.innerHTML = ''

    await renderFormation(homeLineupContainer, homeLineup,matchInfo.home_club_manager_name, matchInfo.home_club_formation);
    await renderFormation(awayLineupContainer, awayLineup, matchInfo.away_club_manager_name,matchInfo.away_club_formation)
}

/**
 * function that render a formation (could be home or away team, it doesn't matter)
 * into a container, maintaining a certain order
 * @param container the formation container
 * @param lineup  consisting of two array, starting_lineup and substitutes
 * @param managerName the name of the manager
 * @param formation the formation type
 */
async function renderFormation(container, lineup, managerName, formation) {
    let startingIds = lineup.starting_lineup.map(player => player.player_id)
    let substituteIds = lineup.substitutes.map(player => player.player_id)
    let goalkeeper = [], defenders = [], midfields = [], strikers = []

    try {
        let positionsMap = await getPositionsGrouped()
        positionsMap=positionsMap.data
        let urls= await getPlayersImgUrlByIds(startingIds, substituteIds)

        lineup.starting_lineup.forEach(player => {
            const match = urls.data.starting_lineup.find(url => url.playerId === player.player_id)
            player.imageUrl = match ? match.imageUrl : playerDefaultImageUrl
        })
        lineup.substitutes.forEach(player => {
            const match = urls.data.substitutes.find(url => url.playerId === player.player_id)
            player.imageUrl = match ? match.imageUrl : playerDefaultImageUrl
        })
        let managerBanner = document.createElement('div')
        managerBanner.className = 'formation-header'
        managerBanner.innerHTML = '<h6><b>Allenatore</b></h6> '
        container.appendChild(managerBanner)
        container.appendChild(renderManagerCard(managerName))

        let startingLineupBanner = document.createElement('div')
        startingLineupBanner.className = 'formation-header'
        startingLineupBanner.innerHTML = `<h6><b>Titolari</b></h6> <p>Formazione: ${formation}</p>`
        container.appendChild(startingLineupBanner)

        lineup.starting_lineup.forEach(player => {
            let playerCard = renderPlayerCard(player)
            if (player.position === MAIN_POSITIONS.GOALKEEPER)
                goalkeeper.push(playerCard)
            else if (positionsMap[MAIN_POSITIONS.DEFENDER].includes(player.position))
                defenders.push(playerCard)
            else if (positionsMap[MAIN_POSITIONS.MIDFIELD].includes(player.position))
                midfields.push(playerCard)
            else
                strikers.push(playerCard)
        })

        appendBannerAndEachPlayer(container,goalkeeper,'Portiere')
        appendBannerAndEachPlayer(container, defenders, 'Difensori')
        appendBannerAndEachPlayer(container, midfields, 'Centrocampisti')
        appendBannerAndEachPlayer(container, strikers, 'Attaccanti')
        //da qui in poi ricreiamo la panchina, ho scelto di non raggruppare per ruolo
        let benchBanner = document.createElement('div')
        benchBanner.className = 'formation-header'
        benchBanner.innerHTML = '<h6><b>Panchina</b></h6> '
        container.appendChild(benchBanner)
        lineup.substitutes.forEach(player => {
            container.appendChild(renderPlayerCard(player))
        })
    }catch(e){
        alert(e)
    }
}
function getPositionsGrouped(){
    return axios.get("http://localhost:3000/players/getSubPositionsGroupedByPosition")
}
function getPlayersImgUrlByIds(startingIds,substituteIds){
    return axios.get("http://localhost:3000/players/getPlayersImgUrlById", {
        params: {
            starting: startingIds.join(","),
            substitutes: substituteIds.join(",")
        }
    })
}
function appendBannerAndEachPlayer(container, playerList, bannerName) {
    container.appendChild(renderFormationRoleBanner(bannerName))
    playerList.forEach(player => {
        container.appendChild(player)
    })
}

/**
 * render the role banner in home or away formation
 * @param role the role name (Goalkeeper, Defender,Midfield,Attack)
 * @returns {HTMLDivElement}
 */
function renderFormationRoleBanner(role) {
    let formationBanner = document.createElement('div')
    formationBanner.className = 'formation-role-banner'
    formationBanner.innerHTML = `<h6><b>${role}</b></h6>`
    return formationBanner
}

/**
 * function that render a single manager card, it's similar to player card
 * but only have name and a default image
 * @param managerName the squad's manager name
 * @returns {HTMLDivElement} the manager card just created.
 */
function renderManagerCard(managerName) {
    let cardDiv = document.createElement('div')
    cardDiv.className = 'manager-card-for-competition'
    cardDiv.innerHTML = `
           <img 
               class="player-card-for-competition-img"
               loading="lazy"
               alt="manager logo"
               src="../images/managerLogo.webp"
            />
            <div class="subbed-player">
                <div class="player-details">
                    <h6>${managerName}</h6>
                </div>
            </div>`

    return cardDiv
}

/**
 * function that render a single player card in the formation
 * @param player the object containing information about a single player
 * @returns {HTMLDivElement} a div element that is a single player card.
 */
function renderPlayerCard(player) {
    let cardDiv = document.createElement('div')
    let teamCaptain = player.team_captain === 1 ? CAPITAIN_SYMBOL : ''
    cardDiv.className = 'player-card-for-competition'
    cardDiv.setAttribute('data-playerid', player.player_id)
    cardDiv.setAttribute('data-name', player.player_name)
    cardDiv.setAttribute('data-imageurl', player.imageUrl)
    cardDiv.setAttribute('data-countryofbirth', player.countryOfBirth)

    cardDiv.innerHTML = `
           <img 
               class="player-card-for-competition-img"
               loading="lazy"
               alt=""
               src="${player.imageUrl}"
            />
            <div class="subbed-player">
                <div class="player-details">
                    <div class="player-number-wrapper">
                        <h6>${player.number}</h6>
                    </div>
                    <h6>${player.player_name} ${teamCaptain}</h6>
                </div>
            </div>`

    return cardDiv
}

