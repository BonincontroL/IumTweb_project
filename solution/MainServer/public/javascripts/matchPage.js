//javascript dedicato alla gestione di un singolo match
let matchInfo //=> Object containing information about the match.
let matchButtons //=> Match buttons.
let currentHomeGoals = 0, currentAwayGoals = 0 //=> Current number of goals scored by the home team. - Current number of goals scored by the away team.
let homeGoalEvents, awayGoalEvents//=>array usati per renderizzare le colonne dei goal nel banner superiore
let isHeadToHeadLoaded =false, isFormationsLoaded=false
const TIME_MINUTES = 45 //=> Number of minutes in a football match.
const CAPITAIN_SYMBOL='(C)' //=> A string symbol to indicate the capitain
const MAIN_POSITIONS={ //=> Main player positions
    GOALKEEPER:"Goalkeeper",
    DEFENDER:"Defender",
    ATTACK:"Attack",
    MIDFIELD: "Midfield"
}

const NO_GOALS_AGGREGATE='0:0' //=> A string that indicates a match aggregate without goals
const PLAYER_DEFAULT_IMG_URL = "https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1" //=> Default image URL for players without information.
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

/**
 * Get and render the "head to head" information
 * about home club and away club
 */
function getHeadToHeadInfos(){
    let url=MAIN_SERVER+"/games/getHeadToHead"
    axios.get(url,{
        params:{
            homeClubId: matchInfo.home_club_id,
            awayClubId: matchInfo.away_club_id,
        }
    }).then(res=>{
        renderHeadToHeadInfos(res.data[0])
        isHeadToHeadLoaded=true //we correctly load head to head
    }).catch(err=>{
        alert(err)
    })
}

/**
 * Render the "head to head" information,
 * in particular it renders the three different Canvas for home wins,
 * draws and away wins
 * @param infos
 */
function renderHeadToHeadInfos(infos){
    const totalMatches =infos.homeWins+infos.awayWins+infos.draws
    document.getElementById('homeLogo').setAttribute('src',`${CLUB_LOGO_IMAGE_URL}${matchInfo.home_club_id}.png`)
    document.getElementById('awayLogo').setAttribute('src',`${CLUB_LOGO_IMAGE_URL}${matchInfo.away_club_id}.png`)

    renderGraph('homeWinsCanvas',infos.homeWins,totalMatches,'Vittorie '+infos.homeWins)
    renderGraph('drawCanvas',infos.draws,totalMatches,'Pareggi '+infos.draws)
    renderGraph('awayWinsCanvas',infos.awayWins,totalMatches,'Vittorie '+infos.awayWins)
}

/**
 * render a single doughnut graph
 * @param graphId the unique identifier of the graph in the DOM
 * @param info
 * @param totalMatch the number of matches played between current home club and away club
 * @param labelText the label to put in the center.
 */
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

/**
 * render the doughnut chart label
 * @param labelText the text to put in the lable
 * @returns {{beforeDatasetDraw(*, *, *): void, id: string}}
 */
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
 * Renders basic information about the match banner.
 * This function isn't responsible for rendering the goals banner!
 */
function renderBannerInfo() {
    let homeClubCard = document.getElementById('homeClubCard')
    let awayClubCard = document.getElementById('awayClubCard')

    //renderizza le informazioni del banner del match
    document.getElementById('homeClubName').innerText = !matchInfo.home_club_name ? 'N.D' : matchInfo.home_club_name
    document.getElementById('awayClubName').innerText = !matchInfo.away_club_name ? 'N.D' : matchInfo.away_club_name
    document.getElementById('homeClubLogo').setAttribute('src', CLUB_LOGO_IMAGE_URL + matchInfo.home_club_id + ".png")
    document.getElementById('awayClubLogo').setAttribute('src', CLUB_LOGO_IMAGE_URL + matchInfo.away_club_id + ".png")
    document.getElementById('aggregate').innerText = matchInfo.aggregate
    //aggiungi la data
    document.getElementById('match-details-date').innerText = matchInfo.date.split('T')[0]

    //aggiungiamo le info alla homeClubCard e awayClubCard
    if (matchInfo.home_club_name){ //se la squadra ha il nome
        homeClubCard.setAttribute('data-clubid', matchInfo.home_club_id);
        homeClubCard.setAttribute('data-name',matchInfo.home_club_name);
    }else //altrimenti non è cliccabile
        homeClubCard.className='match-details-squad-and-logo-home-noclick'

    if (matchInfo.away_club_name){ //se la squadra ha il nome
        awayClubCard.setAttribute('data-clubid', matchInfo.away_club_id);
        awayClubCard.setAttribute('data-name',matchInfo.away_club_name);
    }else //altrimenti non è cliccabile
        awayClubCard.className='match-details-squad-and-logo-away-noclick'
}
/**
 * Retrieves current match events from the DB and then render them.
 * @param {Object} matchIds - Object containing match IDs, we have home club id, away club id and game id.
 */
function getMatchEvents(matchIds) {
    axios.get(MAIN_SERVER+"/gameevents/getMatchEvents", {
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
 * Renders match events on the page and the two banners
 * to the end of the first half and the end of the match.
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
 * @returns {HTMLDivElement} the HTML div of the event
 */
function renderEvent(event) {
    let eventDiv = document.createElement('div')
    let eventLogo = document.createElement('img')
    eventLogo.className = 'game-event-icon'
    let minutesContainer = document.createElement('p')
    minutesContainer.innerText = event.minute + '°'
    let containers = [eventLogo, minutesContainer] //this array contain all the HTML element of a single event
    switch (event.type) {
        case EVENT_TYPES.SUBSTITUTION: {
            eventLogo.setAttribute('src', 'images/gameeventsLogos/substitution-icon.svg');
            let playerInContainer = document.createElement('h6')
            playerInContainer.innerHTML = `Entra: <b>${event.substitute? event.substitute: ND_VALUE}</b>`
            let playerOutContainer = document.createElement('h6')
            playerOutContainer.innerHTML = `Esce: <b>${event.player? event.player: ND_VALUE}</b>`
            containers.push(playerInContainer, playerOutContainer)
            break
        }
        case EVENT_TYPES.GOALS:
            renderGoalEvent(event, eventLogo,containers)
            break;
        case EVENT_TYPES.CARDS:
            if ((event.description.search('Red') !== -1) || (event.description.search('Second') !== -1)) //modo per capire se un cartellino è rosso, potrebbe essere migliorato.
                eventLogo.setAttribute('src', 'images/gameeventsLogos/red-icon.svg')
            else if (event.description.search('Yellow') !== -1) //potrebbe essere migliorato,
                eventLogo.setAttribute('src', 'images/gameeventsLogos/yellow-icon.svg')
            let playercardContainer = document.createElement('h6')
            playercardContainer.innerHTML = `<b>${event.player? event.player: ND_VALUE}</b>`
            containers.push(playercardContainer)
            break;
    }
    if (event.club_id === matchInfo.home_club_id)
        eventDiv.className = 'home-game-event';
    else if (event.club_id === matchInfo.away_club_id) {
        eventDiv.className = 'away-game-event'
        containers.reverse() //in this way we have the mirror effect for club that play away
    }
    containers.forEach(container => {
        eventDiv.appendChild(container)
    })
    return eventDiv;
}
function renderGoalEvent(event, eventLogo,containers){
    let assistPhrase = 'Assist:'
    eventLogo.setAttribute('src', 'images/gameeventsLogos/goal-icon.svg'); //default goal icon
    if (event.description.search('Penalty') !== -1) {
        eventLogo.setAttribute('src', 'images/gameeventsLogos/penaltyScored-icon.svg'); //penalty icon
        assistPhrase = 'Rigore procurato da:'
    } else if (event.description.search('Own-goal') !== -1)
        eventLogo.setAttribute('src', 'images/gameeventsLogos/owngoal-icon.svg'); //own goal icon

    let partialResultContainer = document.createElement('h6')
    partialResultContainer.innerHTML = `${currentHomeGoals}-${currentAwayGoals}`
    containers.push(partialResultContainer)
    if (event.club_id === matchInfo.home_club_id) {
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
}
/**
 * get some match information like refree,stadium, home club manager and away club manager
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

/**
 * render the basic match information like refree, stadium, competition
 * It also creates the competition card that can be clicked to go back to the competition page
 * @param competitionName the name of the competition
 */
function renderMatchInformation(competitionName) {
    document.getElementById('match-details-refree').innerText = matchInfo.referee
    document.getElementById('match-details-stadium').innerText = matchInfo.stadium
    document.getElementById('match-details-competition').innerText=competitionName
    let competitionCard =document.getElementById('competitionCard')
    competitionCard.setAttribute('data-competitionId', matchInfo.competition_id)
    competitionCard.setAttribute('data-competitionName', competitionName)
    document.getElementById('match-details-competitionImg').setAttribute('src', `${COMPETITION_LOGO_IMAGE_URL}${matchInfo.competition_id.toLowerCase()}.png`)
}

/**
 * Get the competition name given the competition identifier from the DB
 * @returns {*} an axios promise
 */
function getCompetitionName() {
    let url = MAIN_SERVER+"/competitions/getName";
    return axios.get(url, {
        params: {
            competition_id: matchInfo.competition_id
        }
    })
}

/**
 * get all the basic game information like home club name, away club name, aggregate...
 * @returns {*} an axios promise
 */
function getGameInfos() {
    let url = MAIN_SERVER+"/games/get";
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

/**
 * Hide all the main containers except the container specified as the parameter
 * @param containerToShow the HTML container we want to display
 */
function hideMatchContainersExceptOne(containerToShow) {
    let matchContainers = document.querySelectorAll('#match-details-container > div')
    matchContainers.forEach(container => {
        container.style.display = "none"
    })
    containerToShow.style.display = "flex"
}

/**
 * Get the home and away clubs formation, which includes the starting players
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

/**
 * get the current match players for home and away club
 * divided in starting players and substitutes.
 * @param matchIds an object that contains match identifiers like home club id, away club id and game id
 * @returns {*} an axios promise
 */
function getMatchPlayers(matchIds){
    let url = MAIN_SERVER+"/gamelineups/getMatchPlayers";
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
            player.imageUrl = match ? match.imageUrl : PLAYER_DEFAULT_IMG_URL
        })
        lineup.substitutes.forEach(player => {
            const match = urls.data.substitutes.find(url => url.playerId === player.player_id)
            player.imageUrl = match ? match.imageUrl : PLAYER_DEFAULT_IMG_URL
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

/**
 * Get all the player positions in the DB grouped by main position (Goalkeeper, Defender..).
 * @returns {*} an axios promise
 */
function getPositionsGrouped(){
    return axios.get(MAIN_SERVER+"/players/getSubPositionsGroupedByPosition")
}

/**
 * Get all the image urls of players that start the game
 * and players that are in the bench
 * @param startingIds a list of player id that start the match
 * @param substituteIds a list of player id that are in the bench
 * @returns {*} an axios promise
 */
function getPlayersImgUrlByIds(startingIds,substituteIds){
    return axios.get(MAIN_SERVER+"/players/getPlayersImgUrlById", {
        params: {
            starting: startingIds.join(","),
            substitutes: substituteIds.join(",")
        }
    })
}

/**
 * render the formation role banner and append all the players in the container
 * @param container the HTML container of a single main role (Defender, Midfield..)
 * @param playerList a list of HTML player cards
 * @param bannerName the name of the banner that represent a main role
 */
function appendBannerAndEachPlayer(container, playerList, bannerName) {
    container.appendChild(renderFormationRoleBanner(bannerName))
    playerList.forEach(player => {
        container.appendChild(player)
    })
}

/**
 * render the role banner in home or away formation
 * @param role the main role name (Goalkeeper, Defender,Midfield,Attack)
 * @returns {HTMLDivElement} the formation role banner just created
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
    let teamCaptain = player.team_captain === 1 ? CAPITAIN_SYMBOL : '' //if is team capitain, we put the capitain symbol.
    cardDiv.className = 'player-card-for-competition'
    cardDiv.setAttribute('data-playerid', player.player_id)
    cardDiv.setAttribute('data-name', player.player_name)
    cardDiv.setAttribute('data-imageurl', player.imageUrl)

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

