let lateralPlayerButtons, playerInfoBtn
const playerPageName= 'player-page'
let playerId;
let isStatsLoaded = false;

document.addEventListener('DOMContentLoaded',()=> {
    let playerInfo = JSON.parse(sessionStorage.getItem('playerInfo'))
    playerId = playerInfo.playerId

    Promise.all([
        getPlayerInfo(),
        getPlayerNumber()
    ]).then(res=>{
        renderPlayerInfo(res[0].data,res[1].data.playerNumber)
    })


    renderPlayerImg(playerInfo)

    playerInfoBtn = document.getElementById('player-info-btn')
    lateralPlayerButtons = document.querySelectorAll('#playerLateralNavbar .lateral-menu-button')
    manageLateralButtons(lateralPlayerButtons, playerPageName)
    //inizialmente solo il bottone Informazioni è premuto

    playerInfoBtn.classList.add('active')
    hideAllMainContainers(playerPageName)
    document.getElementById('playerInformation').style.display = "flex"
    document.getElementById('player-statistic-btn').addEventListener('click', () => {
        if(!isStatsLoaded){
            getPlayerStatistics()
            isStatsLoaded = true
        }
    })



    initLogin();
})
function renderPlayerImg(player){
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
 * get di tutte le statistiche di un singolo giocatore(cartellini gialli, rossi, goal e assist totali)
 */
function getPlayerStatistics() {
    const loadingSpinner= document.getElementById('loading-spinner');
    loadingSpinner.style.display = "block";
        axios.get(`http://localhost:3000/appearances/getPlayerStatistics/${playerId}`)
            .then(response => {
                if(response.status===200){
                    renderPlayerStatistics(response.data)
                }else{
                    renderPlayerStatistics([])
                }
            })
            .catch(error =>{
                console.error(`Error not found statistics for player ${playerId}:`, error);

            }).finally(()=> {
                loadingSpinner.style.display = "none";

        });
    }


    /**
     * funzione che scrive le statistiche del giocatore nella pagina.
     * @param playerStatistics
     */
    function renderPlayerStatistics(playerStatistics) {
        if(playerStatistics.length===0){
            document.getElementById('playerNumYellowCards').innerText = "No data available"
            document.getElementById('playerNumRedCards').innerText = "No data available"
            document.getElementById('playerNumGoals').innerText = "No data available"
            document.getElementById('playerNumAssists').innerText = "No data available"
            document.getElementById('playerNumMinutes').innerText = "No data available"
            document.getElementById('appearances').innerText = "No data available"
        }else{
            document.getElementById('playerNumYellowCards').innerText = playerStatistics[0].total_yellow_cards
            document.getElementById('playerNumRedCards').innerText = playerStatistics[0].total_red_cards
            document.getElementById('playerNumGoals').innerText = playerStatistics[0].total_goals
            document.getElementById('playerNumAssists').innerText = playerStatistics[0].total_assists
            document.getElementById('playerNumMinutes').innerText = playerStatistics[0].total_minutes_played
            document.getElementById('appearances').innerText = playerStatistics[0].appearances


        }

}

/**
 * funzione che scrive le informazioni del giocatore nella pagina.
 * @param playerInfo tutte le informazioni del player
 * @param playerNumber numero della maglia del giocatore
 */
    function renderPlayerInfo(playerInfo,playerNumber) {
        var oggi = new Date();
        var compleanno = new Date(playerInfo.dateOfBirth);
        var eta = oggi.getFullYear() - compleanno.getFullYear();
        document.getElementById('nazionality').innerText = playerInfo.countryOfCitizenship;
        document.getElementById('player_height').innerText = playerInfo.heightInCm;
        document.getElementById('squad_player').innerText = playerInfo.currentClubName;
        document.getElementById('age_player').innerText = eta;
        document.getElementById('player_market_value').innerText = playerInfo.marketValueInEur+" €"
        document.getElementById('playerRole').innerText = playerInfo.subPosition;
        document.getElementById('squadLogo_player').setAttribute('src', clubLogoImgURL+playerInfo.currentClubId+".png")
        if(playerNumber===-1){
            document.getElementById('player_number').innerText = "No data available"
        }else {
            document.getElementById('player_number').innerText = playerNumber;
        }

    }



/**
 * funzione che restituisce le informazioni di un giocatore
 * @param playerId id del giocatore
 * @returns  object con le informazioni  di un giocatore
 */
    function getPlayerInfo(){
        return axios.get(`http://localhost:3000/players/getPlayerById/${playerId}`)
    }



    function getPlayerNumber(){
        return axios.get(`http://localhost:3000/gamelineups/getPlayerNumberByIdPlayer/${playerId}`)
    }






