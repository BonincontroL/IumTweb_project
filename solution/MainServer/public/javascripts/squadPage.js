let lateralSquadButtons, squadInfoBtn
const squadPageName= 'squad-page'
let clubInfo
let lastSeason= 2023;
const MAIN_SERVER="http://localhost:3000"
import {getTable,renderTableRow,renderMatchesRound} from './competitionPage.js'
document.addEventListener('DOMContentLoaded',init)
let isTableLoaded=false, isPlayersLoaded
async function init(){
    const queryString= window.location.search
    const urlParam= new URLSearchParams(queryString)
    clubInfo={
        clubId:parseInt(urlParam.get('club_id'),10),
        name :urlParam.get('name'),
    }
    try{
        let managerName= await getManagerName()
        clubInfo.managerName = managerName.data[0].name;
        let club=await getClubInfo()
        clubInfo.lastSeason=club.data.lastSeason
        clubInfo.stadiumName=club.data.stadiumName
        clubInfo.stadiumSeats=club.data.stadiumSeats
        clubInfo.squadSize=club.data.squadSize
        clubInfo.foreignersPercentage=club.data.foreignersPercentage
        clubInfo.competitionId=club.data.domesticCompetitionId
        let competitionName=await getCompetitionName()
        clubInfo.competitionName = competitionName.data
        renderCompetitionInfo()
        renderGraph()
    }catch(err){
        alert(err)
    }

    squadInfoBtn= document.getElementById('squad-info-btn')
    lateralSquadButtons=document.querySelectorAll('#squadLateralNavbar .lateral-menu-button')
    manageLateralButtons(lateralSquadButtons,squadPageName)
    //inizialmente solo il bottone Informazioni deve essere selezionato
    squadInfoBtn.classList.add('active')
    hideAllMainContainers(squadPageName)
    document.getElementById('squadInformation').style.display="flex"

    document.getElementById('squad-table-btn').addEventListener('click',()=>{
        if(!isTableLoaded){
            getTableAndLastMatches()
        }
    })
    document.getElementById('squad-matches-btn').addEventListener('click',async ()=>{
        try {
            const matches = await getClubGamesInfo()
            renderMatchesRound(matches.data)
        }catch(err){
            alert("Errore nella richiesta delle partite del club",err);
        }
    });
    document.getElementById('squad-players-btn').addEventListener('click',()=>{
        if(!isPlayersLoaded) {
            getClubPlayers()
                .then(res => {
                    let playerCardList = renderClubPlayers(res.data)
                    setPlayersEventListener(playerCardList)
                    isPlayersLoaded=true
                })
                .catch(err => {
                    alert(err)
                })
        }
    })
    initLogin();
}
function renderGraph(){
    const nationalPlayers = 100-clubInfo.foreignersPercentage
    const graph=document.getElementById('squadChart').getContext('2d')
    const squadChart= new Chart(graph,{
        type:'doughnut',
        data:{
            labels:['Giocatori Stranieri', 'Giocatori della nazionale'],
            datasets:[{
                data:[clubInfo.foreignersPercentage,nationalPlayers],
                backgroundColor:[
                    getComputedStyle(document.body).getPropertyValue('--primary-blue-900'),
                    getComputedStyle(document.body).getPropertyValue('--primary-blue-100')
                ]
            }]
        },
        options:{
            responsive:true,
            borderWidth:10,
            borderRadius:2,
            hoverBorderWidth:0,
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    })
}
function getTableAndLastMatches(){
    Promise.all([
        getTable( clubInfo.competitionId, clubInfo.lastSeason,"full"),
        getLast5Games()
    ]).then(res=>{
        renderMiniTable(res[0].data)
        renderLast5Games(res[1].data)
        isTableLoaded=true
    }).catch(err=>{
        alert(err)
    })
}
function getCompetitionName(){
    let url="http://localhost:3000/competitions/getName"
    return axios.get(url,{
        params:{
            competition_id:clubInfo.competitionId
        }
    })
}
function getClubInfo(){
    let url="http://localhost:3000/clubs/get"
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
    document.getElementById('squadCompetitionImageInTable').setAttribute('src',`${competitionLogoImgUrl}${clubInfo.competitionId.toLowerCase()}.png`)
    document.getElementById('squadCompetitionNameInTable').innerText=clubInfo.competitionName

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
    let url ="http://localhost:3000/players/searchByClubIdAndSeason"
    return axios.get(url,{
        params:{
            club_id:clubInfo.clubId,
            season:clubInfo.lastSeason
        }
    })
}
function renderClubPlayers(players){
    let goalkeeperContainer=document.getElementById('GoalkeepersContainer')
    let defenderContainer=document.getElementById('DefenderContainer')
    let midfieldContainer=document.getElementById('MidfieldContainer')
    let strikerContainer=document.getElementById('StrikerContainer')
    goalkeeperContainer.innerHTML=''
    defenderContainer.innerHTML=''
    midfieldContainer.innerHTML=''
    strikerContainer.innerHTML=''
    const playerCardList =[]

    players.forEach(player=>{
        let playerCard= renderPlayerCard(player)
        playerCardList.push(playerCard)
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
    return playerCardList
}
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
                        <p>${player.marketValueInEur} Eur</p>
                   </div>
            </div>
           <img src="${player.imageUrl}" alt="${player.name} image" class="imgplayer-name-child">
        </div>
        <div class="player-card-number-name-container">
           <h4>${player.name}</h4>
        </div>`
    return playerCard
}
function getLast5Games(){
    return axios.get(MAIN_SERVER+'/games/getLast5GamesByClubId',{
        params:{
            club_id:clubInfo.clubId
        }})
}
function renderLast5Games(games){
    let lastMatchContainer= document.getElementById('last5MatchesContainer')
    lastMatchContainer.innerHTML=''
    games.forEach(game=>{
        let gameCard =renderMiniGameCard(game)
        lastMatchContainer.appendChild(gameCard)
    })
}

function renderMiniGameCard(game){
    let miniGameCard= document.createElement('div')
    let gameOutcome, circleClass
    miniGameCard.className='last-match-container'
    if(game.home_club_id===clubInfo.clubId){ //se sei la squadra di casa
        if(game.home_club_goals>game.away_club_goals)
            gameOutcome = "Vittoria"
        else if(game.home_club_goals < game.away_club_goals)
            gameOutcome = "Sconfitta"
        else
            gameOutcome="Pareggio"
    }else{  //se sei la squadra in trasferta...
        if(game.away_club_goals>game.home_club_goals)
            gameOutcome = "Vittoria"
        else if(game.away_club_goals < game.home_club_goals)
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
    miniGameCard.innerHTML=
        `<div class="match-result-vertical">
            <h6>${game.date.split('T')[0]}</h6>
         </div>
         <div class="squad-info-row">
            <img src="${clubLogoImgURL}${game.home_club_id}.png" class="squadLogo" alt ="${game.home_club_name} logo">
            <h6>${game.home_club_goals}</h6>
         </div>
         <div class="squad-info-row">
            <img src="${clubLogoImgURL}${game.away_club_id}.png" class="squadLogo" alt ="${game.home_club_name} logo">
            <h6>${game.away_club_goals}</h6>
         </div>
         <div class="${circleClass}">
            <h6><b>${gameOutcome}</b></h6>
         </div>
        `
    return miniGameCard
}
function getManagerName(){
    return axios.get(MAIN_SERVER+'/games/getLastManager',{
        params:{
            club_id:clubInfo.clubId
        }
    })
}
function getClubGamesInfo() {
    return axios.get(MAIN_SERVER + '/games/getLastGamesByClubIdandSeason', {
        params: {
            club_id: clubInfo.clubId,
            season: lastSeason
        }


    });
}
function renderCompetitionInfo() {
    //nome e logo del club nella barra laterale
    document.getElementById('clubName').innerText = clubInfo.name
    document.getElementById('clubImage').setAttribute('src', `${clubLogoImgURL}${clubInfo.clubId}.png`)
    //nome della competizione + logo
    document.getElementById('squadCompetitionImage').setAttribute('src', `${competitionLogoImgUrl}${clubInfo.competitionId.toLowerCase()}.png`)
    document.getElementById('squadCompetitionName').innerText= clubInfo.competitionName
    //info sullo stadio+numero massimo di spettatori
    document.getElementById('squadStadiumName').innerText=clubInfo.stadiumName
    document.getElementById('squadStadiumCapacity').innerHTML=
        `Spettatori: ${clubInfo.stadiumSeats}`
    //nome allenatore
    document.getElementById('squadManagerName').innerText=clubInfo.managerName
}