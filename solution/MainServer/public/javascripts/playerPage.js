let lateralPlayerButtons, playerInfoBtn
const playerPageName= 'player-page'
document.addEventListener('DOMContentLoaded',()=>{
    playerInfoBtn=document.getElementById('player-info-btn')
    lateralPlayerButtons=document.querySelectorAll('#playerLateralNavbar .lateral-menu-button')
    lateralPlayerButtons.forEach(button=>{
        button.addEventListener('click',()=>{
            hideAllMainContainers(playerPageName)
            let containerToShow = button.getAttribute('data-showContainer')
            document.getElementById(containerToShow).style.display='flex'
        })
    })
    manageLateralButtons(lateralPlayerButtons)
    //inizialmente solo il bottone Informazioni è premuto
    playerInfoBtn.classList.add('active')
    hideAllMainContainers(playerPageName)
    document.getElementById('playerInformation').style.display="flex"
    initLogin();
})