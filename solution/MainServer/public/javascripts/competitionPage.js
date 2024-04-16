let lateralButtons
let matchButtons
const competitionPageName = 'competition-page'
let competition_id, competition_name
let currentSeason = 2023 //la stagione corrente di default è 2023
let currentRound
let matchRounds //array in cui sono contenuti tutti i round della competition
let homeManagerName, awayManagerName
let playerDefaultImageUrl="https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1" //ci sono dei giocatori senza informazioni, per questi giocatori mettiamo l'immagine di default.

document.addEventListener('DOMContentLoaded',()=>{
    const queryString = window.location.search;
    const urlParam= new URLSearchParams(queryString)
    competition_id=urlParam.get('competition_id')
    competition_name = urlParam.get('competition_name')
    document.getElementById('competitionName').innerText=competition_name;

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
    document.getElementById('competition-squad-btn').addEventListener('click', getAllClubs)
    document.getElementById('backToAllMatches').addEventListener('click',()=>{
        document.getElementById('competitionMultipleMatches').style.display='flex'
        document.getElementById('competitionMatchDetails').style.display='none'
    })
    document.getElementById('loadPrevMatchday').addEventListener('click',getPrevMatchday)
    document.getElementById('loadNextMatchday').addEventListener('click',getNextMatchday)
    document.getElementById('competitionSelectMatchday').addEventListener('change',function(){
        currentRound= matchRounds.indexOf(this.value)
        getAllMatchesInRound()
    })

    document.getElementById('competition-table-btn').addEventListener('click',()=>{
        let tableType="full"  //di default, vogliamo la tabella che considera tutte le partite.
        getTable(tableType)
            .then(res=>{
                renderTable(res.data,tableType)
            })
            .catch(err=>{
                alert(JSON.stringify(err))
            })
    })

    initLogin();

})
function getTable(tableType){
    return axios.get("http://localhost:3000/games/getTableByCompSeasonAndType",{
        params:{
            comp_id:competition_id,
            season:currentSeason,
            type:tableType
        }
    })
}
function renderTable(completeLeaugeTable,type){
    let index =0
    let tableBody
    switch (type){
        case 'full':
            tableBody=document.getElementById('competitionFullTable')
            break
        case 'home':
            tableBody=document.getElementById('competitionHomeTable')
            break
        case 'away':
            tableBody=document.getElementById('competitionAwayTable')
            break
        default:
            throw new Error("comando per creare la classifica sconosciuto:"+type+"\n")
    }
    tableBody.innerHTML=''
    completeLeaugeTable.forEach(tableRowData=>{
        let tableRow= renderTableRow(tableRowData,index++)
        tableBody.appendChild(tableRow)
    })
}
function renderTableRow(tableRowData,index){
    let tableRow=document.createElement('tr')
    tableRow.appendChild(renderTableTD(++index))
    tableRow.appendChild(renderTableTDWithLogo(tableRowData._id, tableRowData.club_name))
    let totalGames=tableRowData.vittorie+tableRowData.pareggi+tableRowData.sconfitte
    tableRow.appendChild(renderTableTD(totalGames))
    tableRow.appendChild(renderTableTD(tableRowData.vittorie))
    tableRow.appendChild(renderTableTD(tableRowData.pareggi))
    tableRow.appendChild(renderTableTD(tableRowData.sconfitte))
    tableRow.appendChild(renderTableTD(`${tableRowData.gol_fatti}:${tableRowData.gol_subiti}`))
    tableRow.appendChild(renderTableTD(tableRowData.punti));

    return tableRow
}
function renderTableTD(tdInnerData){
    let singleTd=document.createElement('td')
    singleTd.innerText=tdInnerData
    return singleTd
}
function renderTableTDWithLogo(squadId,squadName){
    let singleTd=document.createElement('td')
    let container=document.createElement('div')
    container.className='career-squad'
    container.innerHTML=
        `<img src="${clubLogoImgURL}${squadId}.png" alt="${squadName} logo" class="squadLogo">
         <p>${squadName}</p>          
        `
    singleTd.appendChild(container)
    return singleTd
}
function getAllClubs(){
    let url="http://localhost:3000/clubs/searchByCompetitionAndSeason"
    axios.get(url, {
        params:{
            competition_id: competition_id,
            season:currentSeason
        }
    }).then(res=> {
        renderAllClubs(res.data)
        setAllClubButtonsListener()
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}
function setAllClubButtonsListener(){
    let clubCards =document.querySelectorAll('.squad-card-mini')
    clubCards.forEach(card=>{
        card.addEventListener('click', function (){
            let clubInfo={
                clubId:card.getAttribute('data-clubid'),
                name:card.getAttribute('data-name'),
                stadiumName: card.getAttribute('data-stadiumname'),
                stadiumSeats: card.getAttribute('data-stadiumseats')
            }
            window.location.href=`../squad_page.html?club_id=${clubInfo.clubId}&name=${clubInfo.name}&stadiumName=${clubInfo.stadiumName}&stadiumSeats=${clubInfo.stadiumSeats}&competitionId=${competition_id}&competitionName=${competition_name}`
        })
    })
}
function renderAllClubs(clubs){
    let clubContainer= document.getElementById('competitionSquads')
    clubContainer.innerHTML=''
    clubs.forEach(club=>{
        let clubCard = renderClubCard(club)
        clubContainer.appendChild(clubCard)
    })
}
function renderClubCard(club){
    let clubCard= document.createElement('div')
    clubCard.className='squad-card-mini'
    clubCard.setAttribute('data-clubId', club.clubId)
    clubCard.setAttribute('data-name', club.name)
    clubCard.setAttribute('data-stadiumName', club.stadiumName)
    clubCard.setAttribute('data-stadiumSeats', club.stadiumSeats)
    clubCard.setAttribute('data-competitionId', competition_id)
    clubCard.innerHTML=
        `<img src="${clubLogoImgURL}${club.clubId}.png" alt ="${club.name} logo" class="competition-big-logo"
          </img>
          <h5>${club.name}</h5>
        `
    return clubCard
}
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
        matchRounds=res.data.sort((a,b)=>{
            let numA=parseInt(a.round.split(".")[0],10)
            let numB =parseInt(b.round.split("."[0]),10)
            return numA-numB;
        }).map(match=>match.round)
        currentRound =0
        renderMatchesDropdownMenu() //di default carichiamo il primo round
        getAllMatchesInRound()
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}

/**
 * function that get the next round if it's possibile
 * if there aren't any rounds, it's not possible to load the next
 */
function getNextMatchday(){
    if(currentRound!== matchRounds.length - 1){
        currentRound++
        getAllMatchesInRound()
    }
}
/**
 * function that get the precedent round if it's possibile
 * if there aren't any rounds, it's not possible to load the next
 */
function getPrevMatchday(){
    if(currentRound!==0){
        currentRound--
        getAllMatchesInRound()
    }
}

/**
 * function that get all the matches in a round, that is
 * specified by matchRounds array in currentRound position
 */
function getAllMatchesInRound(){
    let url='http://localhost:3000/games/getMatchesByCompAndSeasonAndRound'
    axios.get(url, {
        params:{
            comp_id:competition_id,
            season: currentSeason,
            currentRound:matchRounds[currentRound]
        }
    }).then(res=>{
        document.getElementById('competitionSelectMatchday').value=matchRounds[currentRound]
        renderMatchesRound(res.data)
        setAllMatchesButtonListener()
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}

/**
 * render all the matches in a competition's round
 * the matches are into an array sorted by date
 * @param matches the array of all matches in a round sorted by date
 */
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

/**
 * render the single match information in the top banner like
 * home club name, away club name, logos and result.
 * @param matchInfo object which represent the single match information
 */
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
    getMatchEvents(matchIds)
}
function getMatchEvents(matchIds){
    axios.get("http://localhost:3000/gameevents/getMatchEvents",{params:{
        game_id:matchIds.game_id
        }}).then(res=>{
            renderMatchEvents(res.data,+matchIds.home_club_id, +matchIds.away_club_id) //il + serve per convertire le stringhe in numeri
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}
function renderMatchEvents(events, homeClubId, awayClubId){
    let eventsContainer = document.getElementById('match-details-events')
    eventsContainer.innerHTML=''
    events.forEach(event=>{
        let eventDiv= renderEvent(event,homeClubId,awayClubId)
        eventsContainer.appendChild(eventDiv)
    })
}

function renderEvent(event,homeClubId,awayClubId){
    let eventDiv=document.createElement('div')
    let eventLogo = document.createElement('img')
    eventLogo.className='game-event-icon'
    let minutesContainer= document.createElement('p')
    minutesContainer.innerText=event.minute
    let containers=[eventLogo,minutesContainer]
    switch (event.type){
        case 'Substitutions': {
            eventLogo.setAttribute('src', 'images/gameeventsLogos/substitution-icon.svg');
            let playerInContainer= document.createElement('h6')
            playerInContainer.innerHTML=`Entra: <b>${event.player_in_id}</b>`//bisogna trovare il modo per ottenere il nome del giocatore
            let playerOutContainer = document.createElement('h6')
            playerOutContainer.innerHTML= `Esce: <b>${event.player_name}</b>`
            containers.push(playerInContainer,playerOutContainer)
            break
        }case 'Goals':
            eventLogo.setAttribute('src','images/gameeventsLogos/goal-icon.svg');
            let scorerContainer= document.createElement('h6')
            scorerContainer.innerHTML=`<b>${event.player_name}</b>`
            containers.push(scorerContainer)
            if(event.player_assist_id){
                let assistmanContainer= document.createElement('h6')
                assistmanContainer.innerHTML=`Assist:<b>${event.player_assist_id}</b>`
                containers.push(assistmanContainer)
            }
            break;
        case 'Cards':
            if(event.description.search('Red') !==-1)
                eventLogo.setAttribute('src', 'images/gameeventsLogos/red-icon.svg')
            else if(event.description.search('Yellow')!==-1)
                eventLogo.setAttribute('src', 'images/gameeventsLogos/yellow-icon.svg')
            let playercardContainer= document.createElement('h6')
            playercardContainer.innerHTML=`<b>${event.player_name}</b>`
            containers.push(playercardContainer)
            break;
    }
    if(event.club_id ===homeClubId)
        eventDiv.className='home-game-event';
    else if(event.club_id===awayClubId) {
        eventDiv.className = 'away-game-event'
        containers.reverse()
    }
    containers.forEach(container=>{
        eventDiv.appendChild(container)
    })
    return eventDiv;
}
/**
 * get some match information like refree,stadium, home club manager and away club manager
 * @param gameId the identifier of the game
 */
function getMatchInformation(gameId){
    let url = "http://localhost:3000/games/getRefreeAndStadium";
    axios.get(url,{params:{
        game_id:gameId
    }}).then(res=>{
        document.getElementById('match-details-refree').innerText=res.data.referee
        document.getElementById('match-details-stadium').innerText=res.data.stadium
        homeManagerName=res.data.home_club_manager_name
        awayManagerName=res.data.away_club_manager_name
    }).catch(err=>{
        alert(JSON.stringify(err))
    })

}

/**
 * render the dropdown menu including all the competition's rounds, it takes the data in
 * the matchRounds array.
 */
function renderMatchesDropdownMenu(){
    let dropdownContainer=document.getElementById('competitionSelectMatchday')
    dropdownContainer.innerHTML=''
    matchRounds.forEach(singleRound=>{
        let dropdownItem = document.createElement('option')
        dropdownItem.innerHTML=singleRound.split(".")[0]
        dropdownItem.value=singleRound
        dropdownContainer.appendChild(dropdownItem)
    })
}

/**
 * get the home and away clubs formation, which includes the starting players
 * and substitutes (which are player that start the game in the bench)
 * @param matchIds query parameter, is an object formed by game_id, home_club_id and away_club_id
 */
function getMatchFormation(matchIds){
    let url = "http://localhost:3000/gamelineups/getMatchPlayers";
        try{
            axios.get(url,{params:matchIds})
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

    renderFormation(homeLineupContainer, homeLineup,homeManagerName);
    renderFormation(awayLineupContainer,awayLineup,awayManagerName)
}

/**
 *  function that render a formation (could be home or away team, it doesn't matter)
 *  into a container, maintaining a certain order
 * @param container the formation container
 * @param lineup  consisting of two array, starting_lineup and substitutes
 * @param managerName the name of the manager
 */
function renderFormation(container, lineup,managerName){
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
             let managerBanner= document.createElement('div')
             managerBanner.className='formation-header'
             managerBanner.innerHTML=  '<h6><b>Allenatore</b></h6> '
             container.appendChild(managerBanner)
             container.appendChild(renderManagerCard(managerName))

             let startingLineupBanner= document.createElement('div')
             startingLineupBanner.className='formation-header'
             startingLineupBanner.innerHTML=  '<h6><b>Titolari</b></h6> '
             container.appendChild(startingLineupBanner)

             lineup.starting_lineup.forEach(player=>{
                 container.appendChild(renderPlayerCard(player))
             })

             let benchBanner= document.createElement('div')
             benchBanner.className='formation-header'
             benchBanner.innerHTML=  '<h6><b>Panchina</b></h6> '
             container.appendChild(benchBanner)

             lineup.substitutes.forEach(player=>{
                 container.appendChild(renderPlayerCard(player))
             })
     }).catch(err=>{
         alert(JSON.stringify(err))
     })
}

/**
 * function that render a single manager card, it's similar to player card
 * but only have name and a default image
 * @param managerName the squad's manager name
 * @returns {HTMLDivElement} the manager card just created.
 */
function renderManagerCard(managerName){
    let cardDiv = document.createElement('div')
    cardDiv.className = 'player-card-for-competition'
    cardDiv.innerHTML = `
           <img 
               class="player-card-for-competition-img"
               loading="lazy"
               alt="manager logo"
               src="../images/managerLogo.webp"
            />
            <div class="subbed-player">
                <div class="player-details">
                    <h6>${managerName}</h6>
                </div>
            </div>`

    return cardDiv
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
                        <h6>${player.number}</h6>
                    </div>
                    <h6>${player.player_name}</h6>
                </div>
            </div>`

    return cardDiv
}