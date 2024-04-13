let lateralButtons
let matchButtons
const competitionPageName = 'competition-page'
let competition_id
let currentSeason = 2023 //la stagione corrente di default è 2023
let minMatchday, maxMatchday
let gameId =4087929, homeClubId =350, awayClubId=873 //queste variabili servono per la gestione della singola partita
let playerDefaultImageUrl="https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1"
document.addEventListener('DOMContentLoaded',()=>{
    const queryString = window.location.search;
    const urlParam= new URLSearchParams(queryString)
    competition_id=urlParam.get('competition_id')

    let competitionInfoBtn= document.getElementById('competition-info-btn')
    lateralButtons = document.querySelectorAll('#competitionLateralNavbar .lateral-menu-button')
    lateralButtons.forEach(button=>{
        button.addEventListener('click',()=>{
            hideAllMainContainers(competitionPageName)
            let containerToShow = button.getAttribute('data-showContainer')
            document.getElementById(containerToShow).style.display="flex"
        })
    })
    manageLateralButtons(lateralButtons)
    //inizialmente solo il primo bottone ("Informazioni") deve essere attivo.
    competitionInfoBtn.classList.add('active')
    hideAllMainContainers(competitionPageName)
    document.getElementById('competitionInformation').style.display="flex"

    //questa parte è dedicata alla gestione dei bottoni per la singola partita (Informazioni, Eventi, Formazioni)
    //in particolare per mostrare il giusto container in base a quale bottone viene cliccato
    matchButtons = document.querySelectorAll('.match-details-navbar > button')
    matchButtons.forEach(button=>{
        button.addEventListener('click',()=>{
            let containerName = button.getAttribute('data-showContainer')
            let containerToShow = document.getElementById(containerName)
            hideMatchContainersExceptOne(containerToShow)
            //ora rendiamo il bottone l'unico "attivo"
            matchButtons.forEach(btn=>{btn.classList.remove('button-game-navbar-active')})
            button.classList.add('button-game-navbar-active')
        })
    })
    getCompetitionInformation()
    document.getElementById('competition-matches-btn').addEventListener('click',()=>{
        getMatches()
    })
    getMatchFormation();
})

function hideMatchContainersExceptOne(containerToShow) {
    let matchContainers= document.querySelectorAll('#match-details-container > div')
    matchContainers.forEach(container=>{container.style.display="none"})
    containerToShow.style.display="flex"
}

/**
 * do the axios query to get all competition infos
 */
function getCompetitionInformation(){
    let url="http://localhost:3000/getCompetitionInformation"
    axios.get(url,{params:
            {"competition_id":competition_id}
    })
        .then(res=>{
            renderCompetitionInformation(res.data)
        }).catch(err=> {
            alert(JSON.stringify(err))
        })
}
/**
 * render the competition information in the correct HTML places
 * @param competitionInfo the competition object with all infos
 */
function renderCompetitionInformation(competitionInfo){
    document.getElementById('competitionImage').setAttribute('src',competitionLogoImgUrl+competitionInfo.competitionId.toLowerCase()+".png")
    document.getElementById('competitionName').innerText=competitionInfo.name;
    document.getElementById('competitionNation').innerText=competitionInfo.countryName === null ? "Internazionale":competitionInfo.countryName;
    document.getElementById('competitionConfederation').innerText=competitionInfo.confederation
    document.getElementById('competitionType').innerText=competitionInfo.type
}

/**
 * this function start to get all the matches in a single competition year
 * in a specific round.
 */
function getMatches(){
    let url=`http://localhost:3000/games/getRoundNumbers`

    axios.get(url,{
        params:
            {
                comp_id:competition_id,
                season: currentSeason
            }
    }).then(res=>{
        let matchNumbers=res.data.sort((a,b)=>{
            let numA=parseInt(a.round.split(".")[0],10)
            let numB =parseInt(b.round.split("."[0]),10)
            return numA-numB;
        })
        minMatchday=matchNumbers[0].round;
        maxMatchday =matchNumbers[matchNumbers.length-1].round
        renderMatchesDropdownMenu(matchNumbers)
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}

/**
 * render the dropdown menu loading all the matchNumbers values
 * @param matchNumbers
 */
function renderMatchesDropdownMenu(matchNumbers){
    let dropdownContainer=document.getElementById('competitionSelectMatchday')
    matchNumbers.forEach(singleRound=>{
        let dropdownItem = document.createElement('option')
        dropdownItem.innerHTML=singleRound.round.split(".")[0]
        dropdownItem.value=singleRound.round
        dropdownContainer.appendChild(dropdownItem)
    })
}

async function getMatchFormation(){
    let params ={game_id:gameId, home_club_id:homeClubId, away_club_id:awayClubId}
    let url = "http://localhost:3000/gamelineups/getMatchPlayers";
        try{
            let res = await axios.get(url,{params:params})
            let homeLineup = res.data[0].home_lineup[0].lineup
            let awayLineup = res.data[0].away_lineup[0].lineup
            await renderMatchFormation(homeLineup, awayLineup)
        }catch(error){
            alert(JSON.stringify(error))
        }
}

/**
 * this function render the home lineup and away lineup of a specific game,
 * @param homeLineup an object array of all the home team players that have played the game
 * @param awayLineup an object array of all the away team players that have played the game
 */
async function renderMatchFormation(homeLineup, awayLineup){
    let homeLineupContainer= document.getElementById('homeFormationContainer')
    homeLineupContainer.innerHTML=''
    let awayLineupContainer= document.getElementById('awayFormationContainer')
    awayLineupContainer.innerHTML=''

    await renderFormation(homeLineupContainer, homeLineup);
    await renderFormation(awayLineupContainer,awayLineup)
}

/**
 *  function that render a formation (could be home or away team, it doesn't matter)
 *  into a container, mantaining a certain order
 * @param container the formation container
 * @param lineup  consisting of two array, starting_lineup and substitutes
 */
async function renderFormation(container, lineup){
    let startingIds = lineup.starting_lineup.map(player=>player.player_id)
    let substituteIds = lineup.substitutes.map(player=>player.player_id)
    try{
        let res = await axios.get("http://localhost:3000/players/getPlayersImgUrlById",{
            params:{
                starting:startingIds.join(","),
                substitutes: substituteIds.join(",")
            }
        })
        lineup.starting_lineup.forEach(player=>{
            const match= res.data.starting_lineup.find(url=> url.playerId===player.player_id)
            player.imageUrl=match? match.imageUrl: playerDefaultImageUrl
        })
        lineup.substitutes.forEach(player=>{
            const match= res.data.substitutes.find(url=> url.playerId===player.player_id)
            player.imageUrl=match? match.imageUrl: playerDefaultImageUrl
        })

        let startingLineupBanner= document.createElement('div')
        startingLineupBanner.className='formation-header'
        startingLineupBanner.innerHTML=  '<h6>Titolari</h6> '
        container.appendChild(startingLineupBanner)

        lineup.starting_lineup.forEach(player=>{
            container.appendChild(renderPlayerCard(player))
        })

        let benchBanner= document.createElement('div')
        benchBanner.className='formation-header'
        benchBanner.innerHTML=  '<h6>Panchina</h6> '
        container.appendChild(benchBanner)

        lineup.substitutes.forEach(player=>{
            container.appendChild(renderPlayerCard(player))
        })
    }catch (error){
        alert(JSON.stringify(error))
    }
}

function renderPlayerCard(player) {
    let cardDiv = document.createElement('div')
    cardDiv.className = 'player-card-for-competition'
    cardDiv.innerHTML = `
           <img 
               class="player-card-for-competition-img"
               loading="lazy"
               alt=""
               src="${player.imageUrl}"
            />
            <div class="subbed-player">
                <div class="player-details">
                    <div class="player-number-wrapper">
                        <h4>${player.number}</h4>
                    </div>
                    <h4>${player.player_name}</h4>
                </div>
            </div>`

    return cardDiv
}