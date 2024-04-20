let lateralButtons
let matchButtons
const competitionPageName = 'competition-page'
let competitionId, competitionName,lastSeason = 2023 //la stagione corrente di default è 2023
let seasons=[] //array globale che rappresenta tutte le annate giocate.
let currentRound=0
let matchRounds=[] //array in cui sono contenuti tutti i round della competition
let homeManagerName, awayManagerName
let playerDefaultImageUrl="https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1" //ci sono dei giocatori senza informazioni, per questi giocatori mettiamo l'immagine di default.
const TIME_MINUTES=45 //in un tempo di calcio ci sono 45 minuti.
let currentHomeGoals=0, currentAwayGoals=0
let homeGoalEvents,awayGoalEvents//array usati per renderizzare le colonne dei goal nel banner superiore
const isDefender=['Centre-Back','Right-Back','Left-Back']
const isMidfield=['Right Midfield','Left Midfield','Central Midfield', 'Defensive Midfield', 'Attacking Midfield']
const isGoalkeeper ='Goalkeeper'
let gameInfo
let isWithGroup = false //questo booleano serve per indicare se la competizione corrente (visualizzata nella pagina) ha i gruppi oppure no
document.addEventListener('DOMContentLoaded',init)
function init(){
    const queryString = window.location.search;
    const urlParam= new URLSearchParams(queryString)
    const isFromMatchesPage= urlParam.get('isFromMatchesPage')
    if(isFromMatchesPage==='true'){ //in questo caso i dati arrivano dalla pagina matches page quindi devo chiedere competitionName al server
        gameInfo = JSON.parse(sessionStorage.getItem('gameInfo'));
        competitionId=gameInfo.competitionId
       fetchAllRoundNumbers().then(res=>{
            matchRounds = res.data.sort((a, b) => {
                let numA = parseInt(a.round.split(".")[0], 10)
                let numB = parseInt(b.round.split(".")[0], 10)
                return numA - numB;
            }).map(match => match.round);
            if((currentRound=matchRounds.indexOf(gameInfo.round))===-1) //se non trovi il round del match nei currentRound, allora metti il round a 0
                currentRound=0
            renderMatchesDropdownMenu() //di default carichiamo il primo round
            getAllMatchesInRound()
        }).catch(err=>{
            alert(err)
        })

        hideAllMainContainers(competitionPageName)
        document.getElementById('competitionMatches').style.display='flex'
        document.getElementById('competitionMultipleMatches').style.display='none'
        document.getElementById('competitionMatchDetails').style.display='flex'
        document.getElementById('competition-matches-btn').classList.add('active') //in questo modo il bottone predefinito diventa quello delle partite
        renderSingleMatch(gameInfo)
    }else {
        competitionId = urlParam.get('competition_id')
        competitionName = urlParam.get('competition_name')
        //inizialmente solo il primo bottone ("Informazioni") deve essere attivo.
        let competitionInfoBtn= document.getElementById('competition-info-btn')
        competitionInfoBtn.classList.add('active')
        hideAllMainContainers(competitionPageName)
        document.getElementById('competitionInformation').style.display="flex"
    }
    Promise.all([
        getCompetitionSeasons(), //ottieni gli anni in cui la competizione corrente è stata giocata
        getCompetitionInformation()  //ottieni informazioni di base sulla competizione
    ]).then(res=>{
        seasons=res[0].data
        if(isFromMatchesPage)
            lastSeason= gameInfo.season
        else
            lastSeason=seasons[seasons.length-1]
        renderCompetitionInformation(res[1].data)
    }).catch(err=> {
        alert(JSON.stringify(err))
    })
    getCompetitionsWithGroup() //ottieni una lista delle competizioni che hanno i gruppi

    lateralButtons = document.querySelectorAll('#competitionLateralNavbar .lateral-menu-button')
    manageLateralButtons(lateralButtons,competitionPageName)
    manageMatchButtons()
    document.getElementById('competition-matches-btn').addEventListener('click',()=>{
        document.getElementById('competitionMultipleMatches').style.display='flex'
        document.getElementById('competitionMatchDetails').style.display='none'
        getMatches()
    })
    document.getElementById('competition-squad-btn').addEventListener('click', getClubsWrapper)
    document.getElementById('backToAllMatches').addEventListener('click',()=>{
        document.getElementById('competitionMultipleMatches').style.display='flex'
        document.getElementById('competitionMatchDetails').style.display='none'
    })
    document.getElementById('loadPrevMatchday').addEventListener('click',getPrevMatchday)
    document.getElementById('loadNextMatchday').addEventListener('click',getNextMatchday)
    document.getElementById('competitionSelectMatchday').addEventListener('change',function(){
        currentRound= matchRounds.indexOf(this.value)
        getAllMatchesInRound()
        setAllMatchesButtonListener()
    })

    document.getElementById('competition-table-btn').addEventListener('click',async () => {
        if (isWithGroup)
            await getGroupTables()
        else {
            getTable(competitionId, lastSeason, "full")//di default vogliamo la classifica completa
                .then(res => {
                    renderTable(res.data, "full")
                })
                .catch(err => {
                    alert(err)
                })
        }
    })
    document.getElementById('competition-statistic-btn').addEventListener('click',()=>{
        getTopPlayers()
    })
    //parte dedicata alla gestione dei bottoni della classifica
    let competitionTableBtns= document.querySelectorAll('.date-days-picker-wrapper > .date-days-picker')
    manageTableBtns(competitionTableBtns)
    competitionTableBtns[0].addEventListener('click',()=>{
        getTable(competitionId,lastSeason,"full")
            .then(res=>{
                renderTable(res.data,"full")
            }).catch(err=>{
            alert(err)
        })
    })
    competitionTableBtns[1].addEventListener('click',()=>{
        getTable(competitionId,lastSeason,"home")
            .then(res=>{
                renderTable(res.data,"home")
            }).catch(err=>{
            alert(err)
        })
    })
    competitionTableBtns[2].addEventListener('click',()=>{
        getTable(competitionId,lastSeason,"away")
            .then(res=>{
                renderTable(res.data,"away")
            }).catch(err=>{
            alert(err)
        })
    })
    initLogin();
}

/**
 * get all the group tables of a competition (obviously , only for a competition with groups)
 * @returns {Promise<void>}
 */
async function getGroupTables(){
    let groupTables={}
    if(matchRounds.length===0){//lo abbiamo già
        matchRounds= await fetchAllRoundNumbers()
        matchRounds=matchRounds.data.map(round=>round.round)
    }
    let groupNames = matchRounds.filter(round=>round.includes('Group')).sort()
    for (const group of groupNames) {
        
        let table =await getTable(competitionId,lastSeason, 'full', group)
        groupTables[group] = table.data
    }
    renderGroupTables(groupTables)
}

/**
 * render group tables in different containers
 * (one for each table) that will be attached to the same container
 * @param groupTables
 */
function renderGroupTables(groupTables){
    let groupTablesContainer= document.getElementById('competitionTable')
    groupTablesContainer.innerHTML=''
    for (const groupName of Object.keys(groupTables)){
        groupTablesContainer.appendChild(renderGroupTable(groupName, groupTables[groupName]))
    }
}
function renderGroupTable(groupName,groupTable){
    let finalContainer= document.createElement('div')
    finalContainer.className='competitions-group'
    finalContainer.innerHTML=
        `<div class="competitions-group-header">
              <h3>Classifica ${groupName}</h3>
         </div>`
    let tableContiner = document.createElement('div')
    tableContiner.className='table-container'
    tableContiner.innerHTML=
        `<div class="table-navbar">
            <div class="date-days-picker-wrapper">
                            <button data-tbodyid="${groupName}FullTable" class="date-days-picker date-days-picker-active">
                                <h6>Tutti</h6>
                            </button>
                            <button data-tbodyid="${groupName}HomeTable" class="date-days-picker">
                                <h6>Casa</h6>
                            </button>
                            <button data-tbodyid="${groupName}AwayTable" class="date-days-picker">
                                <h6>Trasferta</h6>
                            </button>
                        </div>
                    </div>`
    let table = document.createElement('table')
    table.innerHTML=
        `<thead>
                        <tr>
                            <th>#</th>
                            <th>Squadra</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>Goals</th>
                            <th>PTS</th>
                        </tr>
                        </thead>
                        <tbody id="${groupName}HomeTable">
                        </tbody>
                        <tbody id="${groupName}AwayTable">
                        </tbody>`
    tableContiner.appendChild(table)
    finalContainer.appendChild(tableContiner)
    let fullTable= document.createElement(`tbody`)
    table.appendChild(fullTable)
    fullTable.id =`${groupName}FullTable`
    groupTable.forEach((singleTd,index)=>{
        let tr= renderTableRow(singleTd,index)
        fullTable.appendChild(tr)
    })

    return finalContainer
}
/**
 * fetch all the current competition seasons, save it into a global variabile
 * called seasons and update lastSeason
 */
function getCompetitionSeasons(){
    let url="http://localhost:3000/games/getCompetitionSeasonsSorted"
    return axios.get(url,{
        params:{
            competition_id:competitionId
        }
    })
}
/**
 * get a list of all the competitions that have group and then
 * if my current competition is in this list we set a boolean value to true
 */
function getCompetitionsWithGroup(){
    let url ="http://localhost:3000/games/getCompetitionIdsWithGroup"
    axios.get(url)
        .then(res=>{
            if(res.data.length!==0) {
                let competitionsWithGroup = res.data
                if(competitionsWithGroup.find(comp=>comp.competition_id===competitionId)) {
                    isWithGroup = true
                    document.getElementById('competition-squad-btn').querySelector('h6').innerText='Gruppi' //se la mia lega ha i gruppi, modifichiamo la scritta del bottone laterale.
                }
            }
        })
        .catch(err=>{
            alert(err)
        })
}
function getTopPlayers(){
    let url= `http://localhost:3000/players/getPlayersByCompetitionAndLastSeason/${competitionId}/${lastSeason}`
    axios.get(url)
        .then(res=>{
            renderTopPlayers(res.data.slice(0,5)) //prendi solo i primi 5 giocatori
        })
        .catch(err=>{
            alert(err)
        })
}

function renderTopPlayers(players){
    let playersContainer= document.getElementById('playersTopMarketValueContainer')
    playersContainer.innerHTML=''
    players.forEach((player,index)=>{
        let playerCard
        if(index===0)
            playerCard=renderFirstPlayerCard(player,index)
        else
            playerCard=renderNormalPlayerCard(player,index)
        playersContainer.appendChild(playerCard)
    })
}

function renderFirstPlayerCard(player,index){
    let playerCard= document.createElement('div');
    playerCard.className='player-stats-container-first';
    playerCard.innerHTML=
        `<h3>${index+1}° ${player.name}</h3>
        <div class="player-stats-first-img-container">
            <img src="${player.imageUrl}" alt="${player.name} image" class="player-stats-first-img">
            <div class="player-stats-goals-container">
                <h6>${player.marketValueInEur}</h6>
                <h6>MLN</h6>
            </div> 
        </div>`
    return playerCard
}
function renderNormalPlayerCard(player,index){
    let playerCard= document.createElement('div');
    playerCard.className='player-stats-container';
    playerCard.innerHTML=
        `<h3>${index+1}°</h3>
         <img src="${player.imageUrl}" alt="${player.name} image" class="player-stats-img">
         <h6 class="player-name-in-card">${player.name}</h6>
         <h6>${player.marketValueInEur}</h6>
        `
    return playerCard
}
function manageTableBtns(buttons){
    buttons.forEach(button=>{
        button.addEventListener('click',()=>{
            buttons.forEach(btn=>{btn.classList.remove('date-days-picker-active')})
            button.classList.add('date-days-picker-active')
            let tbodyToShowId = button.getAttribute('data-tbodyid')
            let tbodyToShow= document.getElementById(tbodyToShowId)
            let tbodies=document.querySelectorAll('#competitionTableContainer > tbody')
            tbodies.forEach(tb=>{tb.style.display='none'})
            tbodyToShow.style.display='table-row-group'
        })
    })
}
/**
 * this function is used to switch to the correct container into the single match page
 * it's also used to manage the correct active class of the button
 */
function manageMatchButtons(){
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
}
export function getTable(compId,season,tableType, groupName){
    return axios.get("http://localhost:3000/games/getTableByCompSeasonAndType",{
        params:{
            comp_id:compId,
            season:season,
            type:tableType,
            round:groupName
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
export function renderTableRow(tableRowData,index){
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
function getClubsWrapper(){
    if(isWithGroup)
        getClubsDividedByGroup()
    else
        getClubs()
}
function getClubsDividedByGroup(){
    let url="http://localhost:3000/games/getClubsDividedByGroups"
    axios.get(url,{
        params:{
            competition_id:competitionId,
            season:lastSeason
        }
    }).then(res=>{
        if(res.data!==0) {
            renderClubsDividedByGroup(res.data)
            let clubCards = document.querySelectorAll('#competitionSquads > .squad-card-mini')
            setAllClubButtonsListener(clubCards, competitionId, competitionName)
        }
    })
}
function renderClubsDividedByGroup(groups){
    let mainContainer= document.getElementById('competitionSquads')
    mainContainer.innerHTML=''
    groups.forEach(group=>{
        let groupContainer = renderGroup(group)
        mainContainer.appendChild(groupContainer)
    })
}
function renderGroup(group){
    let groupContainer =document.createElement('div')
    groupContainer.className='competitions-group'
    //creazione del banner che contiene il nome del gruppo (Group A, Group B...)
    let groupNameBanner = document.createElement('div')
    groupNameBanner.className='competitions-group-header'
    groupNameBanner.innerHTML=`<h3>${group.group}</h3>`
    groupContainer.appendChild(groupNameBanner)
    //creazione del div che conterrà le squadre
    let squadsContainer=document.createElement('div')
    squadsContainer.className='competitions-group-container'
    groupContainer.appendChild(squadsContainer)
    //creazione delle varie card per le squadre.
    group.clubs.forEach(club=>{
        let clubCard = renderClubCard(club)
        squadsContainer.appendChild(clubCard)
    })
    return groupContainer
}
function getClubs(){
    let url="http://localhost:3000/clubs/searchByCompetitionAndSeason"
    axios.get(url, {
        params:{
            competition_id: competitionId,
            season:lastSeason
        }
    }).then(res=> {
        if(res.data.length!==0) {
            renderAllClubs(res.data)
            let clubCards = document.querySelectorAll('#competitionSquads > .squad-card-mini')
            setAllClubButtonsListener(clubCards, competitionId, competitionName)
        }
    }).catch(err=>{
        alert(JSON.stringify(err))
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
    clubCard.setAttribute('data-competitionId', competitionId)
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
    return axios.get(url,{params:
            {"competition_id":competitionId}
        })
}
/**
 * render the competition information in the correct HTML places
 * @param competitionInfo the competition object with all infos
 */
function renderCompetitionInformation(competitionInfo){
    competitionName=competitionInfo.name
    document.getElementById('competitionName').innerText=competitionInfo.name+`\n${lastSeason}`;
    document.getElementById('competitionImage').setAttribute('src',competitionLogoImgUrl+competitionInfo.competitionId.toLowerCase()+".png")
    document.getElementById('competitionNation').innerText=competitionInfo.countryName === null ? "Internazionale":competitionInfo.countryName;
    document.getElementById('competitionConfederation').innerText=competitionInfo.confederation
    document.getElementById('competitionType').innerText=competitionInfo.type
}
function fetchAllRoundNumbers(){
    let roundNumbersUrl=`http://localhost:3000/games/getRoundNumbers`
    return axios.get(roundNumbersUrl,{
        params:
            {
                comp_id:competitionId,
                season: lastSeason
            }}
    )
}
/**
 * this function start to get all the matches in a single competition year
 * in a specific round.
 */
function getMatches(){
    fetchAllRoundNumbers().then(res=>{
        matchRounds = res.data.sort((a, b) => {
            let numA = parseInt(a.round.split(".")[0], 10)
            let numB = parseInt(b.round.split(".")[0], 10)
            return numA - numB;
        }).map(match => match.round);
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
            comp_id:competitionId,
            season: lastSeason,
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
    let matchBtns= document.querySelectorAll('.btn-load-match-details')
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
    getMatchEvents(matchIds,matchInfo.aggregate)
}
function getMatchEvents(matchIds,finalResult){
    axios.get("http://localhost:3000/gameevents/getMatchEvents",{params:{
        game_id:matchIds.game_id
        }}).then(res=>{
            renderMatchEvents(res.data,+matchIds.home_club_id, +matchIds.away_club_id,finalResult) //il + serve per convertire le stringhe in numeri
    }).catch(err=>{
        alert(JSON.stringify(err))
    })
}
function renderMatchEvents(events, homeClubId, awayClubId,finalResult){
    let eventsContainer = document.getElementById('match-details-events')
    let isFirstHalfBannerRendered=false
    homeGoalEvents=[]
    awayGoalEvents=[]
    currentHomeGoals=finalResult.split(':')[0]
    currentAwayGoals=finalResult.split(':')[1]
    eventsContainer.innerHTML=''
    //aggiungiamo il banner per il risultato finale.
    eventsContainer.appendChild(renderResultBanner(finalResult,"Partita finita"))
    //aggiungiamo tutti gli altri eventi
    events.forEach((event,index,arr)=>{
        let eventDiv= renderEvent(event,homeClubId,awayClubId,currentHomeGoals,currentAwayGoals)
        eventsContainer.appendChild(eventDiv)
        //controlliamo il banner del primo tempo
        if(index+1<arr.length && !isFirstHalfBannerRendered){
            let nextEvent= arr[index+1]
            if(nextEvent.minute < TIME_MINUTES){
                eventsContainer.appendChild(renderResultBanner(`${currentHomeGoals}:${currentAwayGoals}`,"Fine primo tempo"))
                isFirstHalfBannerRendered=true
            } //se il prossimo evento si trova nel secondo tempo
        }
    })
    renderGoalsRow()
}

/**
 * function that render the goals row in the match banner
 * there are two columns, home and away goals, and for each row
 * there is who scored and the goal/goals minute when he scored
 */
function renderGoalsRow(){
    const homeGoalsColumnContainer= document.querySelector(".match-details-squadGoals-column-left")
    const awayGoalsColumnContainer= document.querySelector(".match-details-squadGoals-column-right")
    homeGoalsColumnContainer.innerHTML=''
    awayGoalsColumnContainer.innerHTML=''
    renderGoalsColumn(homeGoalsColumnContainer,homeGoalEvents)
    renderGoalsColumn(awayGoalsColumnContainer,awayGoalEvents)
}

/**
 * function that render a single goal column in the match banner
 * @param columnContainer the goal column container
 * @param goalEvents a "hash map" where each player is associated to the goals scored
 */
function renderGoalsColumn(columnContainer,goalEvents){
    goalEvents = goalEvents.reduce((acc,goal)=>{
        if(!acc[goal.player_name]){
            acc[goal.player_name]=[]
        }
        acc[goal.player_name].push(goal)
        return acc
    },{})
    Object.keys(goalEvents).forEach(player=>{
        let playerGoalContainer= document.createElement('p')
        let minutes = goalEvents[player].map(goal=>goal.minute+'°').join(', ')
        playerGoalContainer.innerText=`${player} ${minutes}`
        columnContainer.appendChild(playerGoalContainer)
    })
}
/**
 * function that render the partial or final result in the match events page
 * @param result the final or partial result of the match
 * @param phrase the phrase to put in the banner
 * @returns {HTMLDivElement}
 */
function renderResultBanner(result,phrase){
    let resultBanner= document.createElement('div')
    resultBanner.className='match-partial-result-container';
    resultBanner.innerHTML=
        `<h6>${phrase}</h6>
         <h6>${result}</h6>`
    return resultBanner
}

/**
 * function that render a single game event in the correct position,
 * there are three types of game events: Goals, Cards and Substitution
 * @param event the object which represent an event
 * @param homeClubId
 * @param awayClubId
 * @returns {HTMLDivElement}
 */
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
            if(event.description.search('Penalty')!==-1)
                eventLogo.setAttribute('src','images/gameeventsLogos/penaltyScored-icon.svg');
            else
                eventLogo.setAttribute('src','images/gameeventsLogos/goal-icon.svg');

            let partialResultContainer = document.createElement('h6')
            partialResultContainer.innerHTML=`${currentHomeGoals}-${currentAwayGoals}`
            containers.push(partialResultContainer)
            if(event.club_id===homeClubId) {
                currentHomeGoals--
                homeGoalEvents.push(event)
            }else {
                currentAwayGoals--
                awayGoalEvents.push(event)
            }let scorerContainer= document.createElement('h6')
            scorerContainer.innerHTML=`<b>${event.player_name}</b>`
            containers.push(scorerContainer)
            if(event.player_assist_id){
                let assistmanContainer= document.createElement('h6')
                assistmanContainer.innerHTML=`Assist:<b>${event.player_assist_id}</b>`
                containers.push(assistmanContainer)
            }
            break;
        case 'Cards':
            if((event.description.search('Red') !==-1)|| (event.description.search('Second')  !==-1)) //modo per capire se un cartellino è rosso, potrebbe essere migliorato.
                eventLogo.setAttribute('src', 'images/gameeventsLogos/red-icon.svg')
            else if(event.description.search('Yellow')!==-1) //potrebbe essere migliorato,
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
    let goalkeeper=[],defenders=[],midfields=[],strikers=[]
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
                 let playerCard = renderPlayerCard(player)
                 if(player.position===isGoalkeeper)
                     goalkeeper=playerCard
                 else if(isDefender.includes(player.position))
                     defenders.push(playerCard)
                 else if(isMidfield.includes(player.position))
                     midfields.push(playerCard)
                 else
                     strikers.push(playerCard)
             })
             if(goalkeeper!=='undefined')
                container.appendChild(renderFormationRoleBanner('Portiere'))
                container.appendChild(goalkeeper)
             appendBannerAndEachPlayer(container,defenders,'Difensori')
             appendBannerAndEachPlayer(container,midfields,'Centrocampisti')
             appendBannerAndEachPlayer(container,strikers,'Attaccanti')
         //da qui in poi ricreiamo la panchina, ho scelto di non raggruppare per ruolo
             let benchBanner= document.createElement('div')
             benchBanner.className='formation-header'
             benchBanner.innerHTML=  '<h6><b>Panchina</b></h6> '
             container.appendChild(benchBanner)
             lineup.substitutes.forEach(player=>{
                 container.appendChild(renderPlayerCard(player))
             })
         let playerCards = document.querySelectorAll('#'+container.id+' > .player-card-for-competition')
         setPlayersEventListener(playerCards)
     }).catch(err=>{
         alert(JSON.stringify(err))
     })
}
function appendBannerAndEachPlayer(container,playerList,bannerName){
    container.appendChild(renderFormationRoleBanner(bannerName))
    playerList.forEach(player=>{
        container.appendChild(player)
    })
}
function renderFormationRoleBanner(role){
    let formationBanner= document.createElement('div')
    formationBanner.className='formation-role-banner'
    formationBanner.innerHTML=  `<h6><b>${role}</b></h6>`
    return formationBanner
}
/**
 * function that render a single manager card, it's similar to player card
 * but only have name and a default image
 * @param managerName the squad's manager name
 * @returns {HTMLDivElement} the manager card just created.
 */
function renderManagerCard(managerName){
    let cardDiv = document.createElement('div')
    cardDiv.className = 'manager-card-for-competition'
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
    let teamCaptain = player.team_captain === 1? '(C)':''
    cardDiv.className = 'player-card-for-competition'
    cardDiv.setAttribute('data-playerid', player.player_id)
    cardDiv.setAttribute('data-name', player.player_name)
    cardDiv.setAttribute('data-imageurl', player.imageUrl)
    cardDiv.setAttribute('data-countryofbirth', player.countryOfBirth)

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
                    <h6>${player.player_name} ${teamCaptain}</h6>
                </div>
            </div>`

    return cardDiv
}