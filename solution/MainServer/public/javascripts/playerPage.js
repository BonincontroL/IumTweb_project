let lateralPlayerButtons, playerInfoBtn
const playerPageName= 'player-page'
document.addEventListener('DOMContentLoaded',()=>{
    playerInfoBtn=document.getElementById('player-info-btn')
    lateralPlayerButtons=document.querySelectorAll('#playerLateralNavbar .lateral-menu-button')
    manageLateralButtons(lateralPlayerButtons,playerPageName)
    //inizialmente solo il bottone Informazioni è premuto
    playerInfoBtn.classList.add('active')
    hideAllMainContainers(playerPageName)
    document.getElementById('playerInformation').style.display="flex"
    initLogin();
})