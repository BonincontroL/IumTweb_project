//questo JS è per le funzioni comuni
let competitionLogoImgUrl = "https://tmssl.akamaized.net/images/logo/header/"
let clubLogoImgURL = "https://tmssl.akamaized.net/images/wappen/head/"

function manageLateralButtons(lateralButtons,pageName){
    lateralButtons.forEach(btn=>{
        btn.addEventListener('click',function (){
            lateralButtons.forEach(button=>{
                button.classList.remove('active')
                let btnLogo=button.querySelector('img')
                let btnLogoNewSrc =btnLogo.src.replace("Active","")
                btnLogo.setAttribute('src',btnLogoNewSrc)
            })
            //parte dedicata alla gestione delle icone dei bottoni laterali
            this.classList.add('active')
            let btnLogo = this.querySelector('img')
            let btnLogoSrc= btnLogo.getAttribute('src').split('.')[0]
            btnLogoSrc+='Active.svg'
            btnLogo.setAttribute('src',btnLogoSrc)
            //parte dedicata alla gestione dei container
            hideAllMainContainers(pageName)
            let containerToShow = btn.getAttribute('data-showContainer');
            document.getElementById(containerToShow).style.display="flex"

        })
    })
}

function hideAllMainContainers(pageName){
    const mainContainers=document.querySelectorAll(`#${pageName} .main-container`)
    mainContainers.forEach(container=>{container.style.display="none"})
}

function setCompetitionsCardEventListener(competitionCards){
    competitionCards.forEach(card => {
        card.addEventListener('click', () => {
            let competition_id = card.getAttribute('data-competitionId')
            let competition_name = card.getAttribute('data-competitionName')
            let competition_type = card.getAttribute('data-competitionType')
            window.location.href = `../competition_page.html?competition_id=${competition_id}&competition_name=${competition_name}&competition_type=${competition_type}`
        })
    })
}
function setAllClubButtonsListener(clubCards,competition_id, competition_name){
    clubCards.forEach(card=>{
        card.addEventListener('click', function (){
            let clubInfo={
                clubId:card.getAttribute('data-clubid'),
                name:card.getAttribute('data-name'),
                stadiumName: card.getAttribute('data-stadiumname'),
                stadiumSeats: card.getAttribute('data-stadiumseats'),
            }
            if(competition_id===null){
                competition_id=card.getAttribute('data-competitionid')
            }
            window.location.href=`../squad_page.html?club_id=${clubInfo.clubId}&name=${clubInfo.name}&stadiumName=${clubInfo.stadiumName}&stadiumSeats=${clubInfo.stadiumSeats}&competitionId=${competition_id}&competitionName=${competition_name}`
        })
    })
}

/**
 * function used to set the player card event listener, with this you can click on player
 * and go to his page
 * @param playerCards all the player cards in the current page
 */
function setPlayersEventListener(playerCards){
    playerCards.forEach(card=>{
        card.addEventListener('click',()=>{
            let playerInfo ={
                playerId:card.getAttribute('data-playerid'),
                name:card.getAttribute('data-name'),
                imageUrl:card.getAttribute('data-imageurl'),
            }
            sessionStorage.setItem('playerInfo',JSON.stringify(playerInfo))
            window.location.href='../player_page.html'
        })
    })
}
function setMatchesCardEventListener(matchCards){
    matchCards.forEach(match=>{
        match.addEventListener('click',()=>{
            let matchInfo ={
                gameId:match.getAttribute('data-gameid'),
                homeClubId:match.getAttribute('data-homeclubid'),
                awayClubId:match.getAttribute('data-awayclubid'),
                homeClubName:match.getAttribute('data-homeclubname'),
                awayClubName:match.getAttribute('data-awayclubname'),
                aggregate:match.getAttribute('data-aggregate'),
                date:match.getAttribute('data-date')
            }
            sessionStorage.setItem('gameInfo',JSON.stringify(matchInfo))
            window.location.href='../match_page.html'
        })
    })
}
