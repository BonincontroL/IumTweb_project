let lateralPlayerButtons, playerInfoBtn
const playerPageName= 'player-page'
let playerId;
document.addEventListener('DOMContentLoaded',()=>{
    let playerInfo=JSON.parse(sessionStorage.getItem('playerInfo'))
    playerId=playerInfo.playerId
    renderPlayerInfo(playerInfo)
    playerInfoBtn=document.getElementById('player-info-btn')
    lateralPlayerButtons=document.querySelectorAll('#playerLateralNavbar .lateral-menu-button')
    manageLateralButtons(lateralPlayerButtons,playerPageName)
    //inizialmente solo il bottone Informazioni è premuto
    playerInfoBtn.classList.add('active')
    hideAllMainContainers(playerPageName)
    document.getElementById('playerInformation').style.display="flex"
    initLogin();
})
function renderPlayerInfo(player){
    document.getElementById('playerName').innerText=player.name;
    document.getElementById('playerImage').setAttribute('src', player.imageUrl)
}