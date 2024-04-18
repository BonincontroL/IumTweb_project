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
    if( document.getElementById('playerStatistic').style.display==="flex"){
        console.log(getPlayerStatistics(playerId))
    }

    initLogin();
})
function renderPlayerInfo(player){
    document.getElementById('playerName').innerText=player.name;
    document.getElementById('playerImage').setAttribute('src', player.imageUrl)
}


/**
 * get di tutti i player
 * @returns {Promise<unknown | void>}
 */
function getAllPlayers(){
    return axios.get('http://localhost:3000/players/getAllPlayers')
        .then(response => {
            return response.data
        })
        .catch(error => console.error('Error not found players:', error));
}

/**
 * get di tutte  le statistiche di un singolo giocatore( cartellini gialli, rossi, goal e assist totali)
 * @param playerId id del giocatore
 */
function getPlayerStatistics(playerId) {
    return axios.get('http://localhost:3000/appearances/getPlayerStatistics/${playerId}')
        .then(response => response.data)
        .catch(error => console.error(`Error not found statistics for player ${playerId}:`, error));
}






