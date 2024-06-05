let isListenerLoaded=false //=>Flag to check if event listeners are loaded.
const SQUAD_PAGE_NAME= 'squad-page' //=>Constant for the squad page name.
let clubInfo //=>Object to store club information.
let isTableLoaded=false, isPlayersLoaded //=>Flag to check if the table is loaded - Flag to check if players are loaded.

import {getTable,renderTableRow,renderMatchesRound} from './competitionPage.js'

document.addEventListener('DOMContentLoaded',init) //=>Function to initialize the squad page.

/**
 * Initializes the squad page.
 */
async function init(){
    const queryString= window.location.search
    const urlParam= new URLSearchParams(queryString)
    clubInfo={
        clubId:parseInt(urlParam.get('club_id'),10),
        name :urlParam.get('name'),
    }
    try{
        const managerName= await getManagerName()
        const club=await getClubInfo()
        clubInfo.competitionId=club.data.domesticCompetitionId
        const competitionName=await getCompetitionName()
        club.data.managerName = managerName.data[0].name
        clubInfo.lastSeasonInLeauge = club.data.lastSeason //lastSeasonInLeauge is the last season the club played in his league
        clubInfo.competitionName = competitionName.data
        club.data.competitionName=competitionName.data
        renderCompetitionInfo(club.data)
        renderGraph(club.data.squadSize,club.data.foreignersPercentage)
        await getAndRenderLastSeasons() //pre rendering last club seasons.
    }catch(err){
        console.error("There was an error in the init phase",err)
    }
    let lateralButtonsContainer=document.querySelector('#squadLateralNavbar')
    manageLateralButtons(lateralButtonsContainer,SQUAD_PAGE_NAME)
    manageEventDelegation()

    document.getElementById('squad-table-btn').addEventListener('click',()=>{
        if(!isTableLoaded)
            getTableAndLastMatches()
    })
    document.getElementById('squad-matches-btn').addEventListener('click',getLastMatchesWrapper);
    document.getElementById('squad-players-btn').addEventListener('click',()=>{
        if(!isPlayersLoaded) {
            getClubPlayers()
                .then(res => {
                    renderClubPlayers(res.data)
                    isPlayersLoaded=true
                })
                .catch(err => {
                    console.error("There was an error trying to get club players",err)
                })
        }
    })
    initLogin();
}

/**
 * prefetch last club seasons and render the dropdown for last seasons
 * @returns {Promise<void>}
 */
async function getAndRenderLastSeasons(){
    let seasons = await getSeasonsGames();
    seasons = seasons.data.map(item => item.season);
    clubInfo.lastSeason=seasons[0]
    insertSeasons(seasons);
}
/**
 * Wrapper function to fetch the last matches.
 */
async function getLastMatchesWrapper(){
    try {
        const matches = await getClubGamesBySeason(clubInfo.lastSeason);
        renderMatchesRound(matches.data);
        manageSeasonEventListener()
    }catch(err){
        console.error("There was an error trying to get last matches",err);
    }
}

/**
 * Function to manage the season event listener.
 */
function manageSeasonEventListener(){
    if(!isListenerLoaded) {
        document.getElementById("selectPossibleSeason").addEventListener("change", async function () {
            const matches = await getClubGamesBySeason(this.value);
            renderMatchesRound(matches.data)
        })
        isListenerLoaded=true
    }
}
function createChartLabel(labelText){
    return {
        id:'doughnutLabel',
        beforeDatasetDraw(chart,args,pluginOptions){
            const {ctx,data}=chart
            ctx.save()
            const xCoor=chart.getDatasetMeta(0).data[0].x
            const yCoor=chart.getDatasetMeta(0).data[0].y
            ctx.font= 'bold 16px sans-serif';
            ctx.textAlign='center'
            ctx.textBaseline ='middle'
            ctx.fillText(labelText,xCoor,yCoor)
        }
    }
}
/**
 * Renders the squad chart.
 */
function renderGraph(squadSize,foreignersPercentage ){
    const nationalPlayers = 100-foreignersPercentage
    const graph=document.getElementById('squadChart').getContext('2d')
    const doughnutLabel=createChartLabel(squadSize+' giocatori')
    const squadChart= new Chart(graph,{
        type:'doughnut',
        data:{
            labels:['Giocatori Stranieri', 'Giocatori della nazionale'],
            datasets:[{
                data:[foreignersPercentage,nationalPlayers],
                backgroundColor:[
                    getComputedStyle(document.body).getPropertyValue('--primary-blue-900'),
                    getComputedStyle(document.body).getPropertyValue('--primary-blue-50')
                ]
            }]
        },
        options:{
            responsive:true,
            borderRadius:2,
            hoverBorderWidth:0,
            animation: {
                animationScale:true,
                animateRotate: true
            },
            plugins:{
                tooltip: {
                    enabled:true,
                    boxWidth: 20,
                    boxHeight: 20,
                }
            }
        },
        plugins: [
            doughnutLabel
        ]
    })
}


/**
 * Fetches the table and last matches.
 */
function getTableAndLastMatches(){
    Promise.all([
        getTable( clubInfo.competitionId, clubInfo.lastSeasonInLeauge,"full"),
        getClubGamesBySeason(clubInfo.lastSeasonInLeauge,5) //by default we want only last 5 games
    ]).then(res=>{
        renderMiniTable(res[0].data)
        renderLast5Games(res[1].data)
        isTableLoaded=true
    }).catch(err=>{
        console.error("There was an error trying to get mini table and last 5 games",err)
    })
}
function getCompetitionName(){
    let url=MAIN_SERVER+"/competitions/getName"
    return axios.get(url,{
        params:{
            competition_id:clubInfo.competitionId
        }
    })
}
function getClubInfo(){
    let url=MAIN_SERVER+"/clubs/get"
    return axios.get(url,{params:{
        club_id:clubInfo.clubId
    }
    })
}
function renderMiniTable(completeCompetitionTable){
    let miniTable=document.getElementById('squadMiniTableBody')
    const index = completeCompetitionTable.findIndex(squad=>squad._id===clubInfo.clubId)
    let startingIndex= Math.max(0,index-1)
    const lastIndex=Math.min(completeCompetitionTable.length, index+2)
    let miniCompetitionTable=completeCompetitionTable.slice(startingIndex,lastIndex)
    //setta le informazioni del banner
    document.getElementById('squadCompetitionImageInTable').setAttribute('src',`${COMPETITION_LOGO_IMAGE_URL}${clubInfo.competitionId.toLowerCase()}.png`)
    document.getElementById('squadCompetitionNameInTable').innerHTML=`<h5>${clubInfo.competitionName}</h5><h5>(${clubInfo.lastSeasonInLeauge})</h5>`

    miniCompetitionTable.forEach(tableRowData=>{
        let tableRow =renderTableRow(tableRowData,startingIndex)
        if(index===startingIndex++)
            tableRow.classList.add('table-row-active')
        miniTable.appendChild(tableRow)
    })

}

/**
 * function that do an axios request to get all the club players
 * in a certain season
 * @returns {*} the axios promise to manage
 */
function getClubPlayers(){
    let url =MAIN_SERVER+"/players/searchByClubIdAndSeason"
    return axios.get(url,{
        params:{
            club_id:clubInfo.clubId,
            season:clubInfo.lastSeasonInLeauge
        }
    })
}

/**
 * Renders club players into their respective containers based on position.
 * @param {Array} players - Array of player objects.
 * @returns {Array} - Array of player card elements.
 */
function renderClubPlayers(players){
    let goalkeeperContainer=document.getElementById('GoalkeepersContainer')
    let defenderContainer=document.getElementById('DefenderContainer')
    let midfieldContainer=document.getElementById('MidfieldContainer')
    let strikerContainer=document.getElementById('StrikerContainer')
    goalkeeperContainer.innerHTML=''
    defenderContainer.innerHTML=''
    midfieldContainer.innerHTML=''
    strikerContainer.innerHTML=''

    players.forEach(player=>{
        let playerCard= renderPlayerCard(player)
        switch (player.position){
            case 'Goalkeeper':
                goalkeeperContainer.appendChild(playerCard)
                break
            case 'Defender':
                defenderContainer.appendChild(playerCard)
                break
            case 'Midfield':
                midfieldContainer.appendChild(playerCard)
                break
            case 'Attack':
                strikerContainer.appendChild(playerCard)
                break
        }
    })
}

/**
 * Renders a player card with player information.
 * @param {Object} player - Player object containing player information.
 * @returns {HTMLDivElement} - Player card element.
 */
function renderPlayerCard(player){
    const playerCard = document.createElement('div')
    playerCard.className='player-card'
    playerCard.setAttribute('data-playerid',player.playerId)
    playerCard.setAttribute('data-name',player.name)
    playerCard.setAttribute('data-countryOfBirth',player.countryOfBirth)
    playerCard.setAttribute('data-imageurl',player.imageUrl)
    playerCard.innerHTML=
        `<div class="player-card-info-image-container">
            <div class="player-card-generic-info-container">
                   <div class="player-card-generic-info">
                        <p><b>Nazionalità</b></p>
                        <p>${player.countryOfCitizenship}</p>
                   </div>
                   <div class="player-card-generic-info">
                        <p><b>Valore Mercato</b></p>
                        <p>${player.marketValueInEur !==null? player.marketValueInEur +' Eur':'N.D'}</p>
                   </div>
            </div>
           <img src="${player.imageUrl}" alt="${player.name} image" class="imgplayer-name-child">
        </div>
        <div class="player-card-number-name-container">
           <h4>${player.name}</h4>
        </div>`
    return playerCard
}


/**
 * Renders the last 5 games of the club.
 * @param {Array} games - Array of game objects.
 */
function renderLast5Games(games){
    let lastMatchContainer= document.getElementById('last5MatchesContainer')
    lastMatchContainer.innerHTML=''
    games.forEach(game=>{
        let gameCard =renderMiniGameCard(game)
        lastMatchContainer.appendChild(gameCard)
    })
}


/**
 * Renders a miniGameCard with game information.
 * @param {Object} game - Game object containing game information.
 * @returns {HTMLDivElement} - Mini game card element.
 */
function renderMiniGameCard(game){
    let miniGameCard= document.createElement('div')
    let gameOutcome, circleClass
    let homeClubGoals = game.aggregate.split(':')[0]
    let awayClubGoals=game.aggregate.split(':')[1]
    miniGameCard.className='last-match-container';
    miniGameCard.setAttribute('data-gameid',game.game_id);
    miniGameCard.setAttribute('data-homeclubid',game.home_club_id);
    miniGameCard.setAttribute('data-awayclubid',game.away_club_id);

    if(game.home_club_id===clubInfo.clubId){ //se sei la squadra di casa
        if(homeClubGoals>awayClubGoals)
            gameOutcome = "Vittoria"
        else if(homeClubGoals < awayClubGoals)
            gameOutcome = "Sconfitta"
        else
            gameOutcome="Pareggio"
    }else{  //se sei la squadra in trasferta...
        if(homeClubGoals<awayClubGoals)
            gameOutcome = "Vittoria"
        else if(awayClubGoals < homeClubGoals)
            gameOutcome = "Sconfitta"
        else
            gameOutcome="Pareggio"
    }
    switch (gameOutcome){
        case 'Vittoria':
            circleClass="win"
            miniGameCard.style.border="2px solid "+getComputedStyle(document.documentElement).getPropertyValue('--color-win')
            break
        case 'Sconfitta':
            circleClass="lose"
            miniGameCard.style.border="2px solid "+getComputedStyle(document.documentElement).getPropertyValue('--color-lose')
            break
        case 'Pareggio':
            circleClass="draw"
            miniGameCard.style.border="2px solid "+getComputedStyle(document.documentElement).getPropertyValue('--color-draw')
            break
    }
    adaptMatchDate(game)
    miniGameCard.innerHTML=
        `<div class="match-result-vertical">
            <h6>${game.date}</h6>
         </div>
         <div class="squad-info-row">
            <img src="${CLUB_LOGO_IMAGE_URL}${game.home_club_id}.png" class="squadLogo" alt ="${game.home_club_name} logo">
            <h6>${homeClubGoals}</h6>
         </div>
         <div class="squad-info-row">
            <img src="${CLUB_LOGO_IMAGE_URL}${game.away_club_id}.png" class="squadLogo" alt ="${game.away_club_name} logo">
            <h6>${awayClubGoals}</h6>
         </div>
         <div class="${circleClass}">
            <h6><b>${gameOutcome}</b></h6>
         </div>
        `
    return miniGameCard
}

/**
 * Fetches the name of the club manager.
 * @returns {Promise} - Promise object representing the club manager name.
 */
function getManagerName(){
    return axios.get(MAIN_SERVER+'/games/getLastManager',{
        params:{
            club_id:clubInfo.clubId
        }
    })
}

/**
 * inserts the seasons into the drop-down menu
 */
function insertSeasons(seasons){

        let seasonsContainer= document.getElementById("selectPossibleSeason")
        seasonsContainer.innerHTML=''
        seasons.forEach(season=>{
            let option= document.createElement('option')
            option.value= option.text=season;
            seasonsContainer.appendChild(option)
        })
}


/**
 * Fetches information about the club's games for the last season.
 * @returns {Promise} - Promise object representing the club's games information.
 */
function getClubGamesBySeason(season,limit) {
    return axios.get(MAIN_SERVER + '/games/getLastGamesByClubIdandSeason', {
        params: {
            club_id: clubInfo.clubId,
            season: season,
            limit:limit
        }
    });
}

/**
 * Fetches the seasons for which the club has games.
 * @returns {Promise} - Promise object representing the seasons with games.
 */
function getSeasonsGames(){
    return axios.get(MAIN_SERVER+'/games/getSeasonsByClubId',{
        params:{
            club_id:clubInfo.clubId
        }
    })
}

/**
 * Renders information about the competition, including club name, logo, competition name, stadium info, and manager name.
 */
function renderCompetitionInfo(club) {
    //nome e logo del club nella barra laterale
    document.getElementById('clubName').innerText = club.name
    document.getElementById('clubImage').setAttribute('src', `${CLUB_LOGO_IMAGE_URL}${clubInfo.clubId}.png`)
    //nome della competizione + logo
    document.getElementById('squadCompetitionImage').setAttribute('src', `${COMPETITION_LOGO_IMAGE_URL}${clubInfo.competitionId.toLowerCase()}.png`)
    document.getElementById('squadCompetitionName').innerText= club.competitionName
    //info sullo stadio+numero massimo di spettatori
    document.getElementById('squadStadiumName').innerText=club.stadiumName
    document.getElementById('squadStadiumCapacity').innerHTML= `Spettatori: ${club.stadiumSeats}`
    //nome allenatore
    document.getElementById('squadManagerName').innerText=club.managerName
}