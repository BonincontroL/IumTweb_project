let lateralButtons
let matchButtons
const competitionPageName = 'competition-page'
let competition_id
let currentSeason = 2023 //la stagione corrente di default è 2023
let minMatchday, maxMatchday,currentMatchday
let playerDefaultImageUrl="https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1" //ci sono dei giocatori senza informazioni, per questi giocatori mettiamo l'immagine di default.
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
        document.getElementById('competitionMultipleMatches').style.display='flex'
        document.getElementById('competitionMatchDetails').style.display='none'
        getMatches()
    })
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
        let currentRound= document.getElementById('competitionSelectMatchday').value
        getAllMatchesInRound(currentRound)
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}
function getAllMatchesInRound(roundNumber){
    let url='http://localhost:3000/games/getMatchesByCompAndSeasonAndRound'
    axios.get(url, {
        params:{
            comp_id:competition_id,
            season: currentSeason,
            currentRound:roundNumber
        }
    }).then(res=>{
        renderMatchesRound(res.data)
        setAllMatchesButtonListener()
        currentMatchday=roundNumber
        document.getElementById('competitionSelectMatchday').value=currentMatchday
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}
function renderMatchesRound(matches){
    let matchesContainer=document.getElementById('competitionMatchesContainer')
    matchesContainer.innerHTML=''
    matches.forEach(match=>{
        let formattedDate= match.date.split('T')[0];
        let singleMatchElement=document.createElement('div')
        singleMatchElement.className='single-horizontal-match'
        singleMatchElement.innerHTML=
            `<h6>${formattedDate}</h6>
                 <div class="squad-names-and-result-container">
                                <div class="squad-name-wrapper-home">
                                    <h6>${match.home_club_name}</h6>
                                </div>
                                <img
                                        class="squadLogo"
                                        loading="lazy"
                                        alt="${match.home_club_name} logo"
                                        src="${clubLogoImgURL.concat(match.home_club_id)}.png"
                                />

                                <h6>${match.aggregate}</h6>
                                <img
                                        class="squadLogo"
                                        loading="lazy"
                                        alt="${match.away_club_name}"
                                        src="${clubLogoImgURL.concat(match.away_club_id)}.png"
                                />
                                <div class="squad-name-wrapper-away">
                                    <h6>${match.away_club_name}</h6>
                                </div>
                            </div>
                            <button data-gameId="${match.game_id}" data-homeClubId="${match.home_club_id}" data-awayClubId="${match.away_club_id}" data-homeClubName="${match.home_club_name}" data-awayClubName="${match.away_club_name}" data-aggregate="${match.aggregate}" data-date="${formattedDate}" class='btn-load-match-details'>
                                <i class='bx bxs-right-arrow-circle'></i>
                            </button>`
        matchesContainer.appendChild(singleMatchElement)
    })
}
/**
 * render the dropdown menu loading all the matchNumbers values
 * @param matchNumbers
 */

function setAllMatchesButtonListener(){
    matchBtns= document.querySelectorAll('.btn-load-match-details')
    matchBtns.forEach(button=>{
        button.addEventListener('click',()=>{
            let matchBasicInfo= {
                gameId: button.getAttribute('data-gameId'),
                homeClubId: button.getAttribute('data-homeClubId'),
                awayClubId: button.getAttribute('data-awayClubId'),
                homeClubName: button.getAttribute('data-homeClubName'),
                awayClubName: button.getAttribute('data-awayClubName'),
                aggregate: button.getAttribute('data-Aggregate'),
                date: button.getAttribute('data-date')
            }
            document.getElementById('competitionMultipleMatches').style.display='none'
            document.getElementById('competitionMatchDetails').style.display='flex'
            renderSingleMatch(matchBasicInfo)
        })
    })
}
function renderSingleMatch(matchInfo){
    //renderizza le informazioni del banner del match
    document.getElementById('homeClubName').innerText=matchInfo.homeClubName
    document.getElementById('awayClubName').innerText=matchInfo.awayClubName
    document.getElementById('homeClubLogo').setAttribute('src',clubLogoImgURL+matchInfo.homeClubId+".png")
    document.getElementById('awayClubLogo').setAttribute('src',clubLogoImgURL+matchInfo.awayClubId+".png")
    document.getElementById('aggregate').innerText=matchInfo.aggregate
    //aggiungi la data
    document.getElementById('match-details-date').innerText=matchInfo.date
    let matchIds={
        game_id:matchInfo.gameId,
        home_club_id: matchInfo.homeClubId,
        away_club_id: matchInfo.awayClubId
    }
    getMatchInformation(matchInfo.gameId)
    getMatchFormation(matchIds)
}
function getMatchInformation(gameId){
    let url = "http://localhost:3000/games/getRefreeAndStadium";
    axios.get(url,{params:{
        game_id:gameId
    }}).then(res=>{
        document.getElementById('match-details-refree').innerText=res.data.referee
        document.getElementById('match-details-stadium').innerText=res.data.stadium
    }).catch(err=>{
        alert(JSON.stringify(err))
    })

}
function renderMatchesDropdownMenu(matchNumbers){
    let dropdownContainer=document.getElementById('competitionSelectMatchday')
    matchNumbers.forEach(singleRound=>{
        let dropdownItem = document.createElement('option')
        dropdownItem.innerHTML=singleRound.round.split(".")[0]
        dropdownItem.value=singleRound.round
        dropdownContainer.appendChild(dropdownItem)
    })
}

 function getMatchFormation(params){
    let url = "http://localhost:3000/gamelineups/getMatchPlayers";
        try{
            axios.get(url,{params:params})
                .then(res=>{
                    let homeLineup = res.data[0].home_lineup[0].lineup
                    let awayLineup = res.data[0].away_lineup[0].lineup
                    renderMatchFormation(homeLineup, awayLineup)
                })
        }catch(error){
            alert(JSON.stringify(error))
        }
}

/**
 * this function render the home lineup and away lineup of a specific game,
 * @param homeLineup an object array of all the home team players that have played the game
 * @param awayLineup an object array of all the away team players that have played the game
 */
function renderMatchFormation(homeLineup, awayLineup){
    let homeLineupContainer= document.getElementById('homeFormationContainer')
    homeLineupContainer.innerHTML=''
    let awayLineupContainer= document.getElementById('awayFormationContainer')
    awayLineupContainer.innerHTML=''

    renderFormation(homeLineupContainer, homeLineup);
    renderFormation(awayLineupContainer,awayLineup)
}

/**
 *  function that render a formation (could be home or away team, it doesn't matter)
 *  into a container, maintaining a certain order
 * @param container the formation container
 * @param lineup  consisting of two array, starting_lineup and substitutes
 */
function renderFormation(container, lineup){
    let startingIds = lineup.starting_lineup.map(player=>player.player_id)
    let substituteIds = lineup.substitutes.map(player=>player.player_id)
     axios.get("http://localhost:3000/players/getPlayersImgUrlById",{
            params:{
                starting:startingIds.join(","),
                substitutes: substituteIds.join(",")
            }
        }).then(res=>{
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
             startingLineupBanner.innerHTML=  '<h3>Titolari</h3> '
             container.appendChild(startingLineupBanner)

             lineup.starting_lineup.forEach(player=>{
                 container.appendChild(renderPlayerCard(player))
             })

             let benchBanner= document.createElement('div')
             benchBanner.className='formation-header'
             benchBanner.innerHTML=  '<h3>Panchina</h3> '
             container.appendChild(benchBanner)

             lineup.substitutes.forEach(player=>{
                 container.appendChild(renderPlayerCard(player))
             })
     }).catch(err=>{
         alert(JSON.stringify(err))
     })
}

/**
 * function that render a single player card in the formation
 * @param player the object containing information about a single player
 * @returns {HTMLDivElement} a div element that is a single player card.
 */
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
                    <h6>${player.player_name}</h6>
                </div>
            </div>`

    return cardDiv
}