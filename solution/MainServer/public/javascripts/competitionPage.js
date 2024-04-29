let lateralButtons
const competitionPageName = 'competition-page'
let competitionId, competitionName, competitionType
let competitionSeasons=[] //array globale che rappresenta tutte le annate giocate.
let currentRound=0
let matchRounds=[] //array in cui sono contenuti tutte le giornate di una competizione che ha type === domestic_leauge o tutti i gruppi di una competizione che ha type diverso da domestic_leauge
let knockoutRounds =[]
let currentMatchesSeason=0, currentKnockoutSeason=0
let isTopPlayersLoaded=false
let typology
const competitionTypology={
    GROUP:'GROUP',
    DOMESTIC_LEAUGE:'DOMESTIC_LEAUGE',
    CUP:'CUP'
}
document.addEventListener('DOMContentLoaded',init)

async function init() {
    const queryString = window.location.search;
    const urlParam = new URLSearchParams(queryString)
    competitionId = urlParam.get('competition_id')
    competitionName = urlParam.get('competition_name')
    competitionType = urlParam.get('competition_type')
    //inizialmente solo il primo bottone ("Informazioni") deve essere attivo.
    let competitionInfoBtn = document.getElementById('competition-info-btn')
    competitionInfoBtn.classList.add('active')
    hideAllMainContainers(competitionPageName)
    document.getElementById('competitionInformation').style.display = "flex"
    try {
        competitionSeasons= await getCompetitionSeasons() //ottieni gli anni in cui la competizione corrente è stata giocata
        competitionSeasons=competitionSeasons.data
        let competitionInformation = await getCompetitionInformation()  //ottieni informazioni di base sulla competizione
        renderCompetitionInformation(competitionInformation.data)

        let competitionsWithGroup = await getCompetitionsWithGroup()
        if (competitionsWithGroup.data.find(comp => comp.competition_id === competitionId))
            typology=competitionTypology.GROUP
        else if (competitionType === 'domestic_league')
            typology=competitionTypology.DOMESTIC_LEAUGE
        else
            typology=competitionTypology.CUP
        preRenderDropdowns()
        adaptPageToTypology()
        adaptButtonListenersToTypology()
        lateralButtons = document.querySelectorAll('#competitionLateralNavbar .lateral-menu-button')
        manageLateralButtons(lateralButtons, competitionPageName)
        initLogin();
    } catch (e) {
        alert(e)
    }
}
function preRenderDropdowns(){
    if(typology===competitionTypology.DOMESTIC_LEAUGE || typology===competitionTypology.GROUP) {
        renderSeasonDropdownMenu('matchesSeasonSelector')
    }else if(typology===competitionTypology.CUP|| typology===competitionTypology.GROUP)
        renderSeasonDropdownMenu('knockoutSeasonSelector')
    else if(typology===competitionTypology.GROUP) {
        renderSeasonDropdownMenu('groupSeasonSelector')
        manageSeasonDropdownMenuChange('groupTablesSelector')
    }
}
function adaptPageToTypology(){
    switch (typology){
        case competitionTypology.CUP://se siamo in una coppa senza gironi, rimuoviamo i bottoni e i container delle schermate di partite e classifica
            document.getElementById('competition-matches-btn').remove()
            document.getElementById('competitionMatches').remove()
            document.getElementById('competition-table-btn').remove()
            document.getElementById('competitionTable').remove()
            break
        case competitionTypology.GROUP:
            document.getElementById('competition-squad-btn').querySelector('h6').innerText = 'Gruppi' //se la mia lega ha i gruppi, modifichiamo la scritta del bottone laterale.
            break
        case competitionTypology.DOMESTIC_LEAUGE: //in una domestic_leauge non ho la fase finale (knockout)
            document.getElementById('competition-knockout-btn').remove()
            document.getElementById('competitionKnockout').remove()
            break
        default:
            throw new Error("Tipologia della competizione sconosciuta:"+typology)
    }
}
async function manageMatchesSeasonChange(selectedSeason){
    currentRound=0 //si riparte dal primo round ogni cambiamento di season
    let rounds = await fetchAllRoundNumbers(selectedSeason)
    if(typology===competitionTypology.GROUP) {
        matchRounds = rounds.data.filter(round => round.startsWith('Group'))
        knockoutRounds = rounds.data.filter(round => !round.startsWith('Group'))
    }else
        matchRounds=rounds.data

    renderMatchesDropdownMenu()
    getAndRenderMatchesInRound(matchRounds[currentRound],selectedSeason)
}
async function getTableWrapper(){
    if (typology===competitionTypology.GROUP)
        await getGroupTables()
    else {
        getTable(competitionId, competitionSeasons[0], "full")//di default vogliamo la classifica completa
            .then(res => {
                let tableContainer = document.getElementById('competitionTable')
                tableContainer.innerHTML = ''
                tableContainer.appendChild(renderGroupTable(competitionName, res.data))
                createSeasonDropdown()
                renderSeasonDropdownMenu('tableSeasonSelector')
                addSeasonDropdownTableListener()
                //parte dedicata alla gestione dei bottoni della classifica
                let tableBtns = document.querySelectorAll('.date-days-picker-wrapper > .date-days-button')
                manageTableBtns(tableBtns)
                manageTableVariants(tableBtns)
            })
            .catch(err => {
                alert(err)
            })
    }
}
function adaptButtonListenersToTypology(){
    if(typology===competitionTypology.CUP || typology===competitionTypology.GROUP) {
        document.getElementById('competition-knockout-btn').addEventListener('click', getKnockoutMatches)
        document.getElementById('knockoutSeasonSelector').addEventListener('change', async function () {
            let rounds = await fetchAllRoundNumbers(this.value)
            knockoutRounds = rounds.data.filter(round => !round.startsWith('Group'))
            currentKnockoutSeason = this.value
            await getAllMatchesInKnockoutRounds(this.value)
            let knockoutCards = document.querySelectorAll('#knockoutBody > div> div.matches-knockout-group-container > div')
            setMatchesCardEventListener(knockoutCards)
        })
    }if(typology===competitionTypology.GROUP || typology === competitionTypology.DOMESTIC_LEAUGE){
        document.getElementById('competition-matches-btn').addEventListener('click', getGroupMatches)
        document.getElementById('matchesSeasonSelector').addEventListener('change', async function () {
            await manageMatchesSeasonChange(this.value)
        })
        document.getElementById('loadPrevMatchday').addEventListener('click', ()=>{
            let currentSeason= document.getElementById('matchesSeasonSelector').value
            getPrevMatchday(currentSeason)
        })
        document.getElementById('loadNextMatchday').addEventListener('click', ()=>{
            let currentSeason= document.getElementById('matchesSeasonSelector').value
            getNextMatchday(currentSeason)
        })
        document.getElementById('competitionSelectMatchday').addEventListener('change', function () {
            currentRound = matchRounds.indexOf(this.value)
            let currentSeason= document.getElementById('matchesSeasonSelector').value
            getAndRenderMatchesInRound(matchRounds[currentRound],currentSeason)
        })
        document.getElementById('competition-table-btn').addEventListener('click', async function(){
            await getTableWrapper()
        })
    }
    //in ogni caso il bottone delle statistiche ha lo stesso listener
    document.getElementById('competition-statistic-btn').addEventListener('click',()=>{
        if(!isTopPlayersLoaded){
            getTopPlayers()
            isTopPlayersLoaded=true
        }
    })
    document.getElementById('competition-squad-btn').addEventListener('click', getClubsWrapper)
}
/**
 * get all the group tables of a competition (obviously ,used only for a competition with groups)
 * @returns {Promise<void>}
 */
async function getGroupTables(){
    let groupTables={}

    if(matchRounds.length===0){//se non abbiamo ancora caricato matchRounds...
        let rounds = await fetchAllRoundNumbers(competitionSeasons[0])
        matchRounds=rounds.data.filter(round=>round.startsWith('Group'))
        knockoutRounds=rounds.data.filter(round=>!round.startsWith('Group'))
    }

    for (const group of matchRounds) {
        let table =await getTable(competitionId,competitionSeasons[0], 'full', group)
        groupTables[group] = table.data
    }
    renderGroupTables(groupTables)
}
function manageSeasonDropdownMenuChange(selectorId){
    document.getElementById(selectorId).addEventListener('change',async function () {
        let rounds = await fetchAllRoundNumbers(competitionSeasons[0])
        let groupTables={}
        matchRounds = rounds.data.filter(round => round.startsWith('Group'))
        for (const group of matchRounds) {
            let table =await getTable(competitionId,this.value, 'full', group)
            groupTables[group] = table.data
        }
        renderGroupTables(groupTables)
    })
}

/**
 * render group tables in different containers
 * (one for each table) that will be attached to the same container
 * @param groupTables
 */
function renderGroupTables(groupTables){
    let groupTablesContainer= document.getElementById('tablesContainer')
    groupTablesContainer.innerHTML=''
    for (const groupName of Object.keys(groupTables)){
        let groupTableContainer = renderGroupTable(groupName, groupTables[groupName])
        groupTablesContainer.appendChild(groupTableContainer)
        manageTableBtns(groupTableContainer.querySelectorAll('.date-days-picker-wrapper > button')) //prendiamo SOLO i bottoni nel container
    }
    let tableGroupButtons= document.querySelectorAll('.date-days-picker-wrapper > button')
    manageTableVariants(tableGroupButtons)
}

/**
 * function that get the correct table based on what button is clicked
 * and then render it into the correct table body.
 * @param buttons
 */
function manageTableVariants(buttons){
    buttons.forEach(button=>{
        button.addEventListener('click',()=>{
            let group= (typology===competitionTypology.GROUP) ? button.getAttribute('data-group'):null
            let actualYear= typology===competitionTypology.GROUP? document.getElementById('groupTablesSelector').value:document.getElementById('tableSeasonSelector').value
            getTable(competitionId,actualYear,button.getAttribute('data-type'), group)
                .then(res=>{
                    let groupTable = res.data
                    let groupName = button.getAttribute('data-group')
                    let tbodyId = button.getAttribute('data-tbodyid')
                    let table=document.getElementById(groupName)
                    renderTableBody(table,groupName,groupTable,tbodyId) //questo perchè assumiamo che la struttura della tabella sia già stata creata.
                    let tbodyToShow= document.getElementById(tbodyId)
                    hideTbodiesExceptOne(tbodyToShow,table.querySelectorAll('tbody'))
                }).catch(err=>{
                    alert(err)
            })
        })
    })
}
function hideTbodiesExceptOne(tBodyToShow,tBodies){
    tBodies.forEach(tb=>{tb.style.display='none'})
    tBodyToShow.style.display='table-row-group'
}
function renderGroupTable(groupName,groupTable){
    let finalContainer= document.createElement('div')
    let table = renderTableStructure(groupName,finalContainer)
    renderTableBody(table,groupName,groupTable,`${groupName}FullTable`) //di default, poi si potrà rendere dinamico questo valore
    return finalContainer
}
function createSeasonDropdown(){
    let container =document.getElementById('tableNavbar')
    let dropdown = document.createElement('div')
        dropdown.className='dropdown-menu-season-wrapper';
    dropdown.innerHTML=
        '        <h6><label for="tableSeasonSelector">Stagione</label></h6>\n' +
        '    <select id="tableSeasonSelector" class="date-days-picker">\n' +
        '        </select>'
    container.appendChild(dropdown)
}
function addSeasonDropdownTableListener(){
    document.getElementById('tableSeasonSelector').addEventListener('change',function (){
        getTable(competitionId,this.value,"full")
            .then(res=>{
                let groupTable = res.data
                let table=document.getElementById(competitionName)
                let buttons = document.querySelectorAll('.table-navbar>.date-days-picker-wrapper>.date-days-button')
                buttons.forEach(btn=>{btn.classList.remove('date-days-button-active')})
                buttons[0].classList.add('date-days-button-active') //il primo è quello che serve per la classifica Full
                let tbodyToShow=document.getElementById(buttons[0].getAttribute('data-tbodyid'))
                renderTableBody(table,competitionName,groupTable,`${competitionName}FullTable`) //di default, poi si potrà rendere dinamico questo valore
                hideTbodiesExceptOne(tbodyToShow,table.querySelectorAll('tbody'))
            })
            .catch(err=>{
                alert(err)
            })
    })
}
function renderTableBody(table,groupName,groupTable,tbodyId){
    let groupTableTbody= document.getElementById(tbodyId)

    if(groupTableTbody===null) {
        groupTableTbody = document.createElement('tbody')
        groupTableTbody.id=tbodyId
        table.appendChild(groupTableTbody)
    }
    groupTableTbody.innerHTML='' //svuotiamo il container
    groupTable.forEach((singleTd,index)=>{
        let tr= renderTableRow(singleTd,index)
        groupTableTbody.appendChild(tr)
    })
}
function renderTableStructure(groupName,finalContainer){
    finalContainer.className='competitions-group'
    finalContainer.innerHTML=
        `<div class="competitions-group-header">
              <h3>Classifica ${groupName}</h3>
         </div>`
    let tableContiner = document.createElement('div')
    tableContiner.className='table-container'
    tableContiner.innerHTML=
        `<div class="table-navbar" id="tableNavbar">
            <div class="date-days-picker-wrapper">
                            <button data-type="full" data-group="${groupName}" data-tbodyid="${groupName}FullTable" class="date-days-button date-days-button-active">
                                <h6>Tutti</h6>
                            </button>
                            <button data-type="home" data-group="${groupName}" data-tbodyid="${groupName}HomeTable" class="date-days-button">
                                <h6>Casa</h6>
                            </button>
                            <button data-type="away" data-group="${groupName}" data-tbodyid="${groupName}AwayTable" class="date-days-button">
                                <h6>Trasferta</h6>
                            </button>
                        </div>
                    </div>`
    let table = document.createElement('table')
    table.id=groupName
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
                        </thead>`
    tableContiner.appendChild(table)
    finalContainer.appendChild(tableContiner)
    return table
}
/**
 * fetch all the current competition seasons
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
    return axios.get(url)
}

function getTopPlayers() {
    const loadingSpinner= document.getElementById('loading-spinner');
    loadingSpinner.style.display = "block";
    Promise.all([
        getTopPlayersByMarketValue(),
        getTopPlayersByGoals(),
    ]).then(res => {
        renderTopPlayers(res[0].data, 'playersTopMarketValueContainer', 'VALUE')
        renderTopPlayersByGoalWrapper(res[1].data,'playersTopGoalsContainer','GOALS')
    }).catch(err => {
        alert(err)
    }).finally(()=>{
        loadingSpinner.style.display = "none";
    })
}
function renderTopPlayersByGoalWrapper(playersInfo,containerId,type){
    let idList = playersInfo.map(item => item._id)
    axios.get("http://localhost:3000/players/getPlayersImgUrlById", {
        params: {
            starting: idList.join(","),
        }
    }).then(imageRes => {
        let players = mergePlayersAndImage(playersInfo, imageRes.data.starting_lineup)
        renderTopPlayers(players, containerId, type)
    }).catch(err => {
        alert(err)
    })
}
function mergePlayersAndImage(players,images){
    return players.map(player=>{
        const imageInfo= images.find(image=> image.playerId===player._id)
        return{
            playerId:player._id,
            name:player.player_name,
            total_goals:player.total_goals,
            imageUrl: imageInfo? imageInfo.imageUrl:null
        }
    })
}
function getTopPlayersByMarketValue(){
    let url= `http://localhost:3000/players/getPlayersByCompetitionAndLastSeasonSortedByValue/${competitionId}/${competitionSeasons[0]}`
    return axios.get(url)
}
function getTopPlayersByGoals(){
    let url= `http://localhost:3000/appearances/getTopScorer`
    return axios.get(url,{
        params:{
            comp_id:competitionId
        }
    })
}
function renderTopPlayers(players,containerId,type){
    let playersContainer= document.getElementById(containerId)
    playersContainer.innerHTML=''
    if(players.length!==0)
        players.forEach((player,index)=>{
            let playerCard
            if(index===0)
                playerCard=renderFirstPlayerCard(player,index,type)
            else
                playerCard=renderNormalPlayerCard(player,index,type)
            playersContainer.appendChild(playerCard)
        })
    else
        playersContainer.innerHTML='<h4>Nessun giocatore trovato...</h4>'
}

function renderFirstPlayerCard(player,index,type){
    let playerCard= document.createElement('div');
    playerCard.className='player-stats-container-first';
    playerCard.innerHTML=
        `<h3>${index+1}° ${player.name}</h3>
        <div class="player-stats-first-img-container">
            <img src="${player.imageUrl}" alt="${player.name} image" class="player-stats-first-img">
            <div class="player-stats-goals-container">
                <h6>${type==='VALUE'?player.marketValueInEur: player.total_goals}</h6>
                <h6>${type==='VALUE'? 'EUR': 'Goals'}</h6>
            </div> 
        </div>`
    return playerCard
}
function renderNormalPlayerCard(player,index,type){
    let playerCard= document.createElement('div');
    playerCard.className='player-stats-container';
    playerCard.innerHTML=
        `<h3>${index+1}°</h3>
         <img src="${player.imageUrl}" alt="${player.name} image" class="player-stats-img">
         <h6 class="player-name-in-card">${player.name}</h6>
         <h6>${type==='VALUE'?player.marketValueInEur: player.total_goals}</h6>
        `
    return playerCard
}

/**
 * automatically switch between table bodies that contains 'full' 'home' and 'away' tables
 * and automatically assign active class to the clicked button.
 * @param buttons the table buttons to manage.
 */
function manageTableBtns(buttons){
    buttons.forEach(button=>{
        button.addEventListener('click',()=>{
            buttons.forEach(btn=>{btn.classList.remove('date-days-button-active')})
            button.classList.add('date-days-button-active')
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
    if(typology===competitionTypology.GROUP || typology===competitionTypology.CUP)
        getClubsDividedByGroup()
    else
        getClubs()
}
function getClubsDividedByGroup(){
    let url="http://localhost:3000/games/getClubsDividedByGroups"
    axios.get(url,{
        params:{
            competition_id:competitionId,
            season:competitionSeasons[0]
        }
    }).then(res=>{
        if(res.data!==0) {
            let clubs=res.data
            let clubCards
            if(typology===competitionTypology.CUP) {
                clubs = unifyClubs(clubs)
                renderAllClubs(clubs)
                clubCards = document.querySelectorAll('#competitionSquads > .squad-card-mini')
            }else { //in questo caso devi mantenere solo i gruppi
                clubs = clubs.filter(group=>group.group.startsWith('Group'))
                renderClubsDividedByGroup(clubs)
                clubCards= document.querySelectorAll('.competitions-group-container > .squad-card-mini')
            }
            setAllClubButtonsListener(clubCards)
        }
    })
}

function unifyClubs(groups){
    const uniqueClubs=new Map();
    groups.forEach(group=>{
        group.clubs.forEach(club=>{
            if(!uniqueClubs.has(club.clubId)){
                uniqueClubs.set(club.clubId,{
                    name:club.name,
                    clubId:club.clubId
                })
            }
        })
    })
    return Array.from(uniqueClubs.values())
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
        if(club.name!==undefined) {
            let clubCard = renderClubCard(club)
            squadsContainer.appendChild(clubCard)
        }
    })
    return groupContainer
}
function getClubs(){
    let url="http://localhost:3000/clubs/searchByCompetitionAndSeason"
    axios.get(url, {
        params:{
            competition_id: competitionId,
            season:competitionSeasons[0]
        }
    }).then(res=> {
        if(res.data.length!==0) {
            renderAllClubs(res.data)
            let clubCards = document.querySelectorAll('#competitionSquads > .squad-card-mini')
            setAllClubButtonsListener(clubCards)
        }
    }).catch(err=>{
        alert(err)
    })
}
function renderAllClubs(clubs){
    let clubContainer= document.getElementById('competitionSquads')
    clubContainer.innerHTML=''
    clubs.forEach(club=>{
        if(club.name!==undefined) {
            let clubCard = renderClubCard(club)
            clubContainer.appendChild(clubCard)
        }
    })
}
function renderClubCard(club){
    let clubCard= document.createElement('div')
    clubCard.className='squad-card-mini'
    clubCard.setAttribute('data-clubId', club.clubId)
    clubCard.setAttribute('data-name', club.name)
    clubCard.innerHTML=
        `<img src="${clubLogoImgURL}${club.clubId}.png" alt ="${club.name} logo" class="competition-big-logo"
          </img>
          <h5>${club.name}</h5>
        `
    return clubCard
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
    competitionType=competitionInfo.type
    document.getElementById('competitionName').innerText=competitionInfo.name;
    document.getElementById('competitionImage').setAttribute('src',competitionLogoImgUrl+competitionInfo.competitionId.toLowerCase()+".png")
    document.getElementById('competitionNation').innerText=competitionInfo.countryName === null ? "Internazionale":competitionInfo.countryName;
    document.getElementById('competitionConfederation').innerText=competitionInfo.confederation
    document.getElementById('competitionType').innerText=competitionInfo.type
}
function fetchAllRoundNumbers(season){
    let roundNumbersUrl=`http://localhost:3000/games/getRoundNumbers`
    return axios.get(roundNumbersUrl,{
        params:
            {
                comp_id:competitionId,
                season: season
            }}
    )
}
/**
 * this function start to get all the matches in a single competition year
 * in a specific round.
 */
async function getGroupMatches() {
    try {
        if(competitionSeasons.length===0){
            competitionSeasons=await fetchAllSeasons()
            competitionSeasons=competitionSeasons.data
        }
        let selectedSeason =document.getElementById('matchesSeasonSelector').value
        if(currentMatchesSeason!==selectedSeason) {
            matchRounds = await fetchAllRoundNumbers(selectedSeason)
            matchRounds = matchRounds.data
            if(typology===competitionTypology.GROUP)
                matchRounds=matchRounds.filter(round=>round.startsWith('Group'))
            renderMatchesDropdownMenu()
        }
        await getAndRenderGroupMatches(selectedSeason)
    }catch (e){
        alert(e)
    }
}

async function fetchAllSeasons(){
    let seasonsUrl='http://localhost:3000/games/getCompetitionSeasonsSorted'
    return axios.get(seasonsUrl,{
        params:{
            competition_id:competitionId
        }
    })
}
function renderSeasonDropdownMenu(selectorId){
    let seasonsContainer= document.getElementById(selectorId)
    seasonsContainer.innerHTML=''
    competitionSeasons.forEach(season=>{
        let option= document.createElement('option')
        option.value= option.text=season;
        seasonsContainer.appendChild(option)
    })
}
async function getKnockoutMatches(){
    if(competitionSeasons.length!==0) {
        competitionSeasons=await fetchAllSeasons()
        competitionSeasons=competitionSeasons.data
    }
    let season= document.getElementById('knockoutSeasonSelector').value
    if(currentKnockoutSeason!==season) {
        let rounds = await fetchAllRoundNumbers(season)
        knockoutRounds = rounds.data.filter(round => !round.startsWith('Group'))
        await getAllMatchesInKnockoutRounds(season)
        let knockoutCards=document.querySelectorAll('#knockoutBody > div> div.matches-knockout-group-container > div')
        setMatchesCardEventListener(knockoutCards)
    }
}

async function getAndRenderGroupMatches(season) {
    try {
        let matches = await getAllMatchesInRound(matchRounds[currentRound],season)
        renderMatchesRound(matches.data)
        let matchesCard =document.querySelectorAll('#competitionMatchesContainer > div> button')
        setMatchesCardEventListener(matchesCard)
    } catch (e) {
        alert(e)
    }
}
async function getAllMatchesInKnockoutRounds(season){
    let container = document.getElementById('knockoutBody')
    container.innerHTML=''
    for(let round of knockoutRounds) {
        try {
            let matches = await getAllMatchesInRound(round,season)
            container.appendChild(renderKnockoutMatches(matches.data,round))
        }catch (err){
            alert(err)
        }
    }
}
function renderKnockoutMatches(matches,round){
    let roundContainer = document.createElement('div')
    roundContainer.className='matches-knockout-group'
    roundContainer.innerHTML=
        `<div class="matches-knockout-group-header">
            <h3>${round}</h3>
        </div>`
    let matchesContainer = document.createElement('div')
    matchesContainer.className='matches-knockout-group-container'
    roundContainer.appendChild(matchesContainer)

    matches.forEach(match=>{
        let matchCard= renderSingleKnockoutMatch(match)
        matchesContainer.appendChild(matchCard)
    })

    return roundContainer
}

function renderSingleKnockoutMatch(match){
    let matchCard = document.createElement('div')
    matchCard.className='game-information'
    matchCard.setAttribute('data-competitionid',match.competition_id)
    matchCard.setAttribute('data-gameId',match.game_id)
    matchCard.setAttribute('data-homeClubId',match.home_club_id)
    matchCard.setAttribute('data-awayClubId',match.away_club_id)
    matchCard.setAttribute('data-homeClubName',match.home_club_name)
    matchCard.setAttribute('data-awayClubName',match.away_club_name)
    matchCard.setAttribute('data-aggregate',match.aggregate)
    matchCard.setAttribute('data-date',match.date)
    matchCard.setAttribute('data-round',match.round)
    matchCard.setAttribute('data-season',match.season)

    matchCard.innerHTML=
        ` <div class="match-result-vertical">
                            <div class="squad-icon-container">
                                <img class="squad-icon" src="https://tmssl.akamaized.net/images/wappen/head/${match.home_club_id}.png" alt="${match.home_club_name}" />
                                <p>${match.home_club_name}</p>
                                <div class="home-result">
                                    <p>${match.home_club_goals !== undefined ? match.home_club_goals : 'N.D.'}</p>
                                </div>
                            </div>
                            <div class="squad-icon-container">
                                <img class="squad-icon" src="https://tmssl.akamaized.net/images/wappen/head/${match.away_club_id}.png" alt="${match.away_club_name}" />
                                <p> ${match.away_club_name}</p>
                                <div class="away-result">
                                    <p>${match.away_club_goals !== undefined ? match.away_club_goals : 'N.D.'}</p>
                                </div>
                            </div>
                        </div>`
    return matchCard
}
/**
 * function that get the next round if it's possibile
 * if there aren't any rounds, it's not possible to load the next
 */
function getNextMatchday(season){
    if(currentRound!== matchRounds.length - 1){
        currentRound++
        getAndRenderMatchesInRound(matchRounds[currentRound],season)
    }
}
function getAndRenderMatchesInRound(round,season){
    getAllMatchesInRound(round,season)
        .then(res=>{
            renderMatchesRound(res.data)
            document.getElementById('competitionSelectMatchday').value=matchRounds[currentRound]
            let matchesCard =document.querySelectorAll('#competitionMatchesContainer > div> button')
            setMatchesCardEventListener(matchesCard)
        })
        .catch(err=>{
            alert(err)
        })
}
/**
 * function that get the precedent round if it's possibile
 * if there aren't any rounds, it's not possible to load the next
 */
function getPrevMatchday(season){
    if(currentRound!==0){
        currentRound--
        getAndRenderMatchesInRound(matchRounds[currentRound],season)
    }
}

/**
 * function that get all the matches in a round, that is
 * specified by matchRounds array in currentRound position
 */
function getAllMatchesInRound(round,season){
    let url='http://localhost:3000/games/getMatchesByCompAndSeasonAndRound'
    return axios.get(url, {
        params:{
            comp_id:competitionId,
            season: season,
            currentRound:round
        }
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
                            <button data-gameId="${match.game_id}" data-homeClubId="${match.home_club_id}" data-awayClubId="${match.away_club_id}" data-homeClubName="${match.home_club_name}" data-awayClubName="${match.away_club_name}" data-aggregate="${match.aggregate}" data-date="${formattedDate}" data-competitionId="${match.competition_id}" class='btn-load-match-details'>
                                <i class='bx bxs-right-arrow-circle'></i>
                            </button>`
        matchesContainer.appendChild(singleMatchElement)
    })
}

/**
 * render the dropdown menu including all the competition's rounds,
 * both used to render the group dropdown menu in a cup competition and render
 * the match dropdown menu in a domestic_league competition
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
