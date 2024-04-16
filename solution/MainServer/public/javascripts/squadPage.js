let lateralSquadButtons, squadInfoBtn
const squadPageName= 'squad-page'
let clubId
const MAIN_SERVER="http://localhost:3000"

document.addEventListener('DOMContentLoaded',()=>{
    const queryString= window.location.search
    const urlParam= new URLSearchParams(queryString)
    clubId= parseInt(urlParam.get('club_id'),10)

    const clubInfo={
        clubId:clubId,
        name :urlParam.get('name'),
        stadium:{
            stadiumName:urlParam.get('stadiumName'),
            stadiumSeats:urlParam.get('stadiumSeats')
        },
        competition:{
            competitionId: urlParam.get('competitionId'),
            competitionName: urlParam.get('competitionName')
        }
    }
    getManagerName() //ottieni il nome del manager, ritorna un array con un solo elemento.
        .then(res=>{
            clubInfo.managerName=res.data[0].name
            renderBasicInfo(clubInfo)
        }).catch(err=>{
            alert(JSON.stringify(err))
    })
    squadInfoBtn= document.getElementById('squad-info-btn')
    lateralSquadButtons=document.querySelectorAll('#squadLateralNavbar .lateral-menu-button')
    manageLateralButtons(lateralSquadButtons,squadPageName)
    //inizialmente solo il bottone Informazioni deve essere selezionato
    squadInfoBtn.classList.add('active')
    hideAllMainContainers(squadPageName)
    document.getElementById('squadInformation').style.display="flex"
    document.getElementById('squad-table-btn').addEventListener('click',()=>{
        getLast5Games()
            .then(res=>{
                renderLast5Games(res.data)
            })
            .catch(err=>{
                alert(JSON.stringify(err))
            })
    })
    initLogin();
})
function getLast5Games(){
    return axios.get(MAIN_SERVER+'/games/getLast5GamesByClubId',{
        params:{
            club_id:clubId
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
    if(game.home_club_id===clubId){ //se sei la squadra di casa
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
            club_id:clubId
        }
    })
}
function renderBasicInfo(clubInfo) {
    //nome e logo del club nella barra laterale
    document.getElementById('clubName').innerText = clubInfo.name
    document.getElementById('clubImage').setAttribute('src', `${clubLogoImgURL}${clubInfo.clubId}.png`)
    //nome della competizione + logo
    document.getElementById('squadCompetitionImage').setAttribute('src', `${competitionLogoImgUrl}${clubInfo.competition.competitionId.toLowerCase()}.png`)
    document.getElementById('squadCompetitionName').innerText= clubInfo.competition.competitionName
    //info sullo stadio+numero massimo di spettatori
    document.getElementById('squadStadiumName').innerText=clubInfo.stadium.stadiumName
    document.getElementById('squadStadiumCapacity').innerHTML=
        `<b>Spettatori</b><br>${clubInfo.stadium.stadiumSeats}`
    //nome allenatore
    document.getElementById('squadManagerName').innerText=clubInfo.managerName
}