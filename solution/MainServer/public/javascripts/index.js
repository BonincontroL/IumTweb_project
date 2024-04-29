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


/**
 * Sets event listener for competition cards to navigate to competition page.
 * @param {NodeList} competitionCards - List of competition cards.
 */
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

/**
 * Sets event listener for club buttons to navigate to club squad page.
 * @param {NodeList} clubCards - List of club cards.
 */
function setAllClubButtonsListener(clubCards){
    clubCards.forEach(card=>{
        card.addEventListener('click', function (){
            let clubInfo={
                clubId:card.getAttribute('data-clubid'),
                name:card.getAttribute('data-name'),
            }
            window.location.href=`../squad_page.html?club_id=${clubInfo.clubId}&name=${clubInfo.name}`
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


/**
 * Sets event listener for match cards to navigate to match page.
 * @param {NodeList} matchCards - List of match cards.
 */
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
                date:match.getAttribute('data-date'),
                competitionId:match.getAttribute('data-competitionId'),
                round:match.getAttribute('data-round')
            }
            sessionStorage.setItem('gameInfo',JSON.stringify(matchInfo))
            window.location.href='../match_page.html'
        })
    })
}

function adaptMatchDate(match){
    match.date = new Date(match.date).toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}
