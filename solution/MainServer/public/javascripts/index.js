//questo JS è per le funzioni comuni
/**
 * Common functions for managing UI elements and interactions.
 */

/**
 * Constant for the main server URL.
 * @type {string}
 */
const MAIN_SERVER="http://localhost:3000"

/**
 * URL for competition logo images.
 * @type {string}
 */
const COMPETITION_LOGO_IMAGE_URL = "https://tmssl.akamaized.net/images/logo/header/"

/**
 * URL for club logo images.
 * @type {string}
 */
const CLUB_LOGO_IMAGE_URL = "https://tmssl.akamaized.net/images/wappen/head/"
/**
 * Default value for missing values
 * @type {string}
 */
const ND_VALUE="N.D"

/**
 * Event listener for DOMContentLoaded event of all pages.
 * Used to command opening/closing of the burger menu
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
 * Manages lateral buttons behavior and the switch between different page sections.
 * @param lateralButtonsContainer the HTML element that contains all the lateral buttons
 * @param {string} pageName - Name of the page.
 */
function manageLateralButtons(lateralButtonsContainer,pageName){
        lateralButtonsContainer.addEventListener('click',function (event){
            const btn= event.target.closest('.lateral-menu-button')
            if(btn){
                const lateralButtons = lateralButtonsContainer.querySelectorAll('.lateral-menu-button')
                lateralButtons.forEach(button=>{
                    button.classList.remove('active')
                    let btnLogo=button.querySelector('img')
                    let btnLogoNewSrc =btnLogo.src.replace("Active","")
                    btnLogo.setAttribute('src',btnLogoNewSrc)
                })
                //parte dedicata alla gestione delle icone dei bottoni laterali
                btn.classList.add('active')
                let btnLogo = btn.querySelector('img')
                let btnLogoSrc= btnLogo.getAttribute('src').split('.')[0]
                btnLogoSrc+='Active.svg'
                btnLogo.setAttribute('src',btnLogoSrc)
                //parte dedicata alla gestione dei container
                hideAllMainContainers(pageName)
                let containerToShow = btn.getAttribute('data-showContainer');
                document.getElementById(containerToShow).style.display="flex"
            }
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

/**
 * manage the event delegation, with this technique I can manage click on different
 * cards (for example: player card, match, competition card...) and are having the same behavior
 * function used in each page that display some of them cards
 */
function manageEventDelegation(){
    document.addEventListener('click',function (event){
        //section dedicated to manage card clicks
        const targetClub = event.target.closest('.squad-tr') || event.target.closest('.squad-card-mini') || event.target.closest('.match-details-squad-and-logo-home') || event.target.closest('.match-details-squad-and-logo-away')
        if(targetClub)
            goToClubPage(targetClub)

        const targetMatch= event.target.closest('.btn-load-match-details') || event.target.closest('.game-information') || event.target.closest('.game-information-in-player') || event.target.closest('.last-match-container')
        if(targetMatch)
            goToMatchPage(targetMatch)

        const targetCompetition = event.target.closest('.competition-card-mini')||event.target.closest('.competition-card')||event.target.closest('.match-info-clickable')
        if(targetCompetition)
            goToCompetitionPage(targetCompetition)

        const targetPlayer = event.target.closest('.player-card')||event.target.closest('.player-card2') || event.target.closest('.player-card-for-competition') || event.target.closest('.player-card-for-homepage') || event.target.closest('.player-stats-container-first') || event.target.closest('.player-stats-container')
        if(targetPlayer)
            goToPlayerPage(targetPlayer)
    })
}
function goToClubPage(clubCard){
    let clubInfo={
        clubId:clubCard.getAttribute('data-clubid'),
        name:clubCard.getAttribute('data-name'),
    }
    window.location.href=`../squad_page.html?club_id=${clubInfo.clubId}&name=${clubInfo.name}`
}
function goToMatchPage(matchCard){
    let matchInfo ={
        game_id:matchCard.getAttribute('data-gameid'),
        home_club_id:matchCard.getAttribute('data-homeclubid'),
        away_club_id:matchCard.getAttribute('data-awayclubid'),
    }
    sessionStorage.setItem('gameInfo',JSON.stringify(matchInfo))
    window.location.href='../match_page.html'
}
function goToCompetitionPage(competitionCard){
    let competition_id = competitionCard.getAttribute('data-competitionId')
    let competition_name = competitionCard.getAttribute('data-competitionName')
    window.location.href = `../competition_page.html?competition_id=${competition_id}&competition_name=${competition_name}`
}
function goToPlayerPage(playerCard){
    let playerInfo ={
        playerId:playerCard.getAttribute('data-playerid'),
        name:playerCard.getAttribute('data-name'),
        imageUrl:playerCard.getAttribute('data-imageurl'),
    }
    sessionStorage.setItem('playerInfo',JSON.stringify(playerInfo))
    window.location.href='../player_page.html'
}
function adaptMatchDate(match){
    match.date = new Date(match.date).toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}
