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
    axios.get(`http://localhost:3000/appearances/getPlayerStatistics/${playerId}`)
        .then(response => {
            console.log(response.data);
            renderPlayerStatistics(response.data)


        })
            .catch(error => console.error(`Error not found statistics for player ${playerId}:`, error));


    /**
     * funzione che scrive le statistiche del giocatore nella pagina.
     * @param playerStatistics
     */
    function renderPlayerStatistics(playerStatistics) {
    document.getElementById('playerNumYellowCards').innerText = playerStatistics[0].total_yellow_cards
    document.getElementById('playerNumRedCards').innerText = playerStatistics[0].total_red_cards
    document.getElementById('playerNumGoals').innerText = playerStatistics[0].total_goals
    document.getElementById('playerNumAssists').innerText = playerStatistics[0].total_assists
    document.getElementById('playerNumMinutes').innerText = playerStatistics[0].total_minutes_played

}

}




