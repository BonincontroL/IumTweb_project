//questo JS è per le funzioni comuni
/**
 * Common functions for managing UI elements and interactions.
 */

/**
 * URL for competition logo images.
 * @type {string}
 */
let competitionLogoImgUrl = "https://tmssl.akamaized.net/images/logo/header/"

/**
 * URL for club logo images.
 * @type {string}
 */
let clubLogoImgURL = "https://tmssl.akamaized.net/images/wappen/head/"

/**
 * Event listener for DOMContentLoaded event.
 */
document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('openBurgerMenu').addEventListener('click',()=>{
        let dropdownMenu= document.getElementById('burgerMenu')
        if(dropdownMenu.style.display==='flex')
            document.getElementById('burgerMenu').style.display='none'
        else
            document.getElementById('burgerMenu').style.display='flex'
    })
})

/**
 * Manages lateral buttons behavior.
 * @param {NodeList} lateralButtons - List of lateral buttons.
 * @param {string} pageName - Name of the page.
 */
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

/**
 * Manages filter popup visibility.
 */
function manageFilterPopup(){
    let filterButton= document.getElementById('filterButton')
    let filterContainer= document.getElementById('filterContainer')
    document.addEventListener('click',function (event){
        if(filterContainer.contains(event.target) || filterButton.contains(event.target))
            filterContainer.style.display='flex'
        else
            filterContainer.style.display='none'
    })
}

/**
 * Hides all main containers of the specified page.
 * @param {string} pageName - Name of the page.
 */
function hideAllMainContainers(pageName){
    const mainContainers=document.querySelectorAll(`#${pageName} > .main-container`)
    mainContainers.forEach(container=>{container.style.display="none"})
}

function manageEventDelegation(){
    document.addEventListener('click',function (event){
        const targetClub = event.target.closest('tr') || event.target.closest('.squad-card-mini')
        if(targetClub){
            let clubInfo={
                clubId:targetClub.getAttribute('data-clubid'),
                name:targetClub.getAttribute('data-name'),
            }
            window.location.href=`../squad_page.html?club_id=${clubInfo.clubId}&name=${clubInfo.name}`
        }
        const targetMatch= event.target.closest('.btn-load-match-details') || event.target.closest('.game-information') || event.target.closest('.game-information-in-player') || event.target.closest('.last-match-container')
        if(targetMatch){
            let matchInfo ={
                game_id:targetMatch.getAttribute('data-gameid'),
                home_club_id:targetMatch.getAttribute('data-homeclubid'),
                away_club_id:targetMatch.getAttribute('data-awayclubid'),
            }
            sessionStorage.setItem('gameInfo',JSON.stringify(matchInfo))
            window.location.href='../match_page.html'
        }
        const targetCompetition = event.target.closest('.competition-card-mini')||event.target.closest('.competition-card')
        if(targetCompetition){
            let competition_id = targetCompetition.getAttribute('data-competitionId')
            let competition_name = targetCompetition.getAttribute('data-competitionName')
            let competition_type = targetCompetition.getAttribute('data-competitionType')
            window.location.href = `../competition_page.html?competition_id=${competition_id}&competition_name=${competition_name}&competition_type=${competition_type}`
        }
        const targetPlayer = event.target.closest('.player-card')||event.target.closest('.player-card2') || event.target.closest('.player-card-for-competition') || event.target.closest('.player-card-for-homepage') || event.target.closest('.player-stats-container-first') || event.target.closest('.player-stats-container')
        if(targetPlayer){
            let playerInfo ={
                playerId:targetPlayer.getAttribute('data-playerid'),
                name:targetPlayer.getAttribute('data-name'),
                imageUrl:targetPlayer.getAttribute('data-imageurl'),
            }
            sessionStorage.setItem('playerInfo',JSON.stringify(playerInfo))
            window.location.href='../player_page.html'        }

    })
}

function adaptMatchDate(match){
    match.date = new Date(match.date).toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}
