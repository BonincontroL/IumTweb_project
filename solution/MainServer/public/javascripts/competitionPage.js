let competitionId, competitionName, competitionType   //=> Represents the ID of the competition. - Represents the name of the competition. - Represents the type of the competition.
let competitionSeasons=[] //=> Represents an array of competition seasons.
let currentRound=0  //=>Represents the current round of matches.
let matchRounds=[] //array in cui sono contenuti tutte le giornate di una competizione che ha type === domestic_league o tutti i gruppi di una competizione che ha type diverso da domestic_leauge
let knockoutRounds =[]  //=> Represents an array of knockout rounds.
let currentMatchesSeason=0, currentKnockoutSeason=0 //=> Represents the current season for matches. - Represents the current season for knockout matches.
let isTopPlayersLoaded=false  //=>Represents whether the top players have been loaded.
let typology //=>Represents the typology of the competition.

const COMPETITION_PAGE_NAME = 'competition-page'  //=> Represents the name of the competition page.
const GROUP_KEYWORD ="Group" //represents the value with which we distinguish the games played in groups
const COMPETITION_TYPOLOGIES={ //=> Represents competition typology constants.
    GROUP_CUP:'GROUP', //a competition that have a group phase and a cup phase
    DOMESTIC_LEAUGE:'DOMESTIC_LEAUGE',
    CUP:'CUP' //a competition that only have knockout phase
}
const DOMESTIC_LEAUGE ='domestic_league'
const TABLE_TYPES={
    FULL:"FULL",
    HOME:"HOME",
    AWAY:"AWAY"
}
const PLAYER_CLASSIFIC_TYPOLOGIES={
    VALUE:'VALUE',
    GOALS:'GOALS'
}
document.addEventListener('DOMContentLoaded',init)

/**
 * Initializes the competition page.
 * Fetches competition data and initializes page elements.
 */
async function init() {
    const queryString = window.location.search;
    const urlParam = new URLSearchParams(queryString)
    competitionId = urlParam.get('competition_id')
    competitionName = urlParam.get('competition_name')

    try {
        competitionSeasons= await getCompetitionSeasons() //ottieni gli anni in cui la competizione corrente è stata giocata
        competitionSeasons=competitionSeasons.data
        let competitionInformation = await getCompetitionInformation()  //ottieni informazioni di base sulla competizione
        competitionType=competitionInformation.data.type;
        renderCompetitionInformation(competitionInformation.data)
        let competitionsWithGroup = await getCompetitionsWithGroup()
        assignTypology(competitionsWithGroup)
        preRenderDropdowns()
        adaptPageToTypology()
        adaptButtonListenersToTypology()
        let lateralButtons = document.querySelector('#competitionLateralNavbar')
        manageLateralButtons(lateralButtons, COMPETITION_PAGE_NAME)
        manageEventDelegation()
        initLogin();
    } catch (e) {
        console.error("There was an error in the init function",e)
    }
}

/**
 * assign a value to the global variable typology
 *
 * @param competitionsWithGroup the competitions in our db that have group phase
 */
function assignTypology(competitionsWithGroup){
    if (competitionsWithGroup.data.find(comp => comp.competition_id === competitionId))
        typology=COMPETITION_TYPOLOGIES.GROUP_CUP
    else if (competitionType === DOMESTIC_LEAUGE)
        typology=COMPETITION_TYPOLOGIES.DOMESTIC_LEAUGE
    else
        typology=COMPETITION_TYPOLOGIES.CUP
}
/**
 * Pre-renders dropdown menus based on competition typology.
 */
function preRenderDropdowns(){
    if(typology===COMPETITION_TYPOLOGIES.GROUP_CUP) {
        renderSeasonDropdownMenu('knockoutSeasonSelector')
        renderSeasonDropdownMenu('groupTablesSelector')
        manageSeasonDropdownMenuChange('groupTablesSelector')
        renderSeasonDropdownMenu('matchesSeasonSelector')
    }else if(typology===COMPETITION_TYPOLOGIES.CUP)
        renderSeasonDropdownMenu('knockoutSeasonSelector')
    else{
        renderSeasonDropdownMenu('groupTablesSelector')
        manageSeasonDropdownMenuChange('groupTablesSelector')
        renderSeasonDropdownMenu('matchesSeasonSelector')
    }
}

/**
 * Adapts page elements based on competition typology.
 */
function adaptPageToTypology(){
    switch (typology){
        case COMPETITION_TYPOLOGIES.CUP://se siamo in una coppa senza gironi, rimuoviamo i bottoni e i container delle schermate di partite e classifica
            document.getElementById('competition-matches-btn').remove()
            document.getElementById('competitionMatches').remove()
            document.getElementById('competition-table-btn').remove()
            document.getElementById('competitionTable').remove()
            break
        case COMPETITION_TYPOLOGIES.GROUP_CUP:
            document.getElementById('competition-squad-btn').querySelector('h6').innerText = 'Gruppi' //se la mia lega ha i gruppi, modifichiamo la scritta del bottone laterale.
            break
        case COMPETITION_TYPOLOGIES.DOMESTIC_LEAUGE: //in una domestic_league non ho la fase finale (knockout)
            document.getElementById('competition-knockout-btn').remove()
            document.getElementById('competitionKnockout').remove()
            break
        default:
            throw new Error("Tipologia della competizione sconosciuta:"+typology)
    }
}

/**
 * Manages the change of matches season.
 * @param {number} selectedSeason - The selected season.
 */
async function manageMatchesSeasonChange(selectedSeason){
    currentRound=0 //si riparte dal primo round ogni cambiamento di season
    const rounds = await fetchAllRoundNumbers(selectedSeason)
    if(typology===COMPETITION_TYPOLOGIES.GROUP_CUP) {
        matchRounds = rounds.data.groupRounds
        knockoutRounds = rounds.data.otherRounds
    }else
        matchRounds=rounds.data.otherRounds

    renderMatchesDropdownMenu()
    getAndRenderMatchesInRound(matchRounds[currentRound],selectedSeason)
}

/**
 * Gets the wrapper for the table.
 * Fetches and renders table data based on competition typology.
 */
async function getTableWrapper(){
    try {
        if (typology === COMPETITION_TYPOLOGIES.GROUP_CUP)
            await getGroupTables()
        else {
            let res = await getTable(competitionId, competitionSeasons[0], TABLE_TYPES.FULL)//di default vogliamo la classifica completa
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
        }
    }catch (e){
        console.error("There was an error trying to take competition tables",e)
    }
}

/**
 * Adapts button listeners based on competition typology.
 */
function adaptButtonListenersToTypology(){
    if(typology===COMPETITION_TYPOLOGIES.CUP || typology===COMPETITION_TYPOLOGIES.GROUP_CUP) {
        document.getElementById('competition-knockout-btn').addEventListener('click', getKnockoutMatches)
        document.getElementById('knockoutSeasonSelector').addEventListener('change', async function () {
            const rounds = await fetchAllRoundNumbers(this.value)
            knockoutRounds = rounds.data.otherRounds //otherRounds are knockoutRounds
            currentKnockoutSeason = this.value
            if (knockoutRounds.length === 0)
                document.getElementById('noKnockoutError').style.display = 'flex'
            else
                await getAllMatchesInKnockoutRounds(this.value)
        })
    }if(typology===COMPETITION_TYPOLOGIES.GROUP_CUP || typology === COMPETITION_TYPOLOGIES.DOMESTIC_LEAUGE){
        document.getElementById('competition-matches-btn').addEventListener('click', getGroupMatches)
        document.getElementById('matchesSeasonSelector').addEventListener('change', async function () {
            document.getElementById('loadPrevMatchday').className='btn-disabled' //to reset next and prev buttons.
            document.getElementById('loadNextMatchday').className='btn-choose-matchdays'
            await manageMatchesSeasonChange(this.value)
        })
        document.getElementById('loadPrevMatchday').addEventListener('click', ()=>{
            const currentSeason= document.getElementById('matchesSeasonSelector').value
            getPrevMatchday(currentSeason)
        })
        document.getElementById('loadNextMatchday').addEventListener('click', ()=>{
            const currentSeason= document.getElementById('matchesSeasonSelector').value
            getNextMatchday(currentSeason)
        })
        document.getElementById('competitionSelectMatchday').addEventListener('change', function () {
            const prevButton = document.getElementById('loadPrevMatchday')
            const nextButton = document.getElementById('loadNextMatchday')
            const currentSeason= document.getElementById('matchesSeasonSelector').value
            currentRound = matchRounds.indexOf(this.value)
            //parte dedicata alla gestione delle classi dei bottoni avanti e indietro per i round
            if(currentRound===0)
                prevButton.className='btn-disabled'
            else if(currentRound===matchRounds.length-1)
                nextButton.className='btn-disabled'
            else{
                prevButton.className='btn-choose-matchdays'
                nextButton.className='btn-choose-matchdays'
            }
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
        const rounds = await fetchAllRoundNumbers(competitionSeasons[0])
        matchRounds=rounds.data.groupRounds
    }
    for (const group of matchRounds) {
        const table =await getTable(competitionId,competitionSeasons[0], TABLE_TYPES.FULL, group)
        groupTables[group] = table.data
    }
    renderGroupTables(groupTables)
}

/**
 * Function that "wrap" the selector with "selectorId" event listener,
 * which allows to reload the table when you choose a different season
 * @param selectorId the unique id of season selector.
 */
function manageSeasonDropdownMenuChange(selectorId){
    document.getElementById(selectorId).addEventListener('change',async function () {
        let rounds = await fetchAllRoundNumbers(this.value)
        let groupTables={}
        matchRounds = rounds.data.groupRounds
        for (const group of matchRounds) {
            let table =await getTable(competitionId,this.value, TABLE_TYPES.FULL, group)
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
        button.addEventListener('click', ()=>{
            let group= (typology===COMPETITION_TYPOLOGIES.GROUP_CUP) ? button.getAttribute('data-group'):null
            let actualYear= typology===COMPETITION_TYPOLOGIES.GROUP_CUP? document.getElementById('groupTablesSelector').value:document.getElementById('tableSeasonSelector').value
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
                    console.error("There was an error trying to take competition table",err)
            })
        })
    })
}

/**
 * Hides all table bodies except the one to be shown.
 * @param tBodyToShow
 * @param tBodies
 */
function hideTbodiesExceptOne(tBodyToShow,tBodies){
    tBodies.forEach(tb=>{tb.style.display='none'})
    tBodyToShow.style.display='table-row-group'
}

/**
 * Renders the group table with the provided group name and data.
 * @param groupName
 * @param groupTable
 * @returns {HTMLDivElement}
 */
function renderGroupTable(groupName,groupTable){
    let finalContainer= document.createElement('div')
    let table = renderTableStructure(groupName,finalContainer)
    renderTableBody(table,groupName,groupTable,`${groupName}FullTable`) //di default, poi si potrà rendere dinamico questo valore
    return finalContainer
}

/**
 * Creates a dropdown for selecting seasons and appends it to the table navigation bar.
 */
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


/**
 * Adds a listener to the season dropdown for updating the table content based on the selected season.
 */
function addSeasonDropdownTableListener(){
    document.getElementById('tableSeasonSelector').addEventListener('change',function (){
        getTable(competitionId,this.value,TABLE_TYPES.FULL)
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
                console.error("There was an error trying to take the competition table",err)
            })
    })
}

/**
 * Renders the table body with the provided data and appends it to the table.
 * @param table
 * @param groupName
 * @param groupTable
 * @param tbodyId
 */
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
                            <button data-type= ${TABLE_TYPES.FULL} data-group="${groupName}" data-tbodyid="${groupName}FullTable" class="date-days-button date-days-button-active">
                                <h6>Tutti</h6>
                            </button>
                            <button data-type=${TABLE_TYPES.HOME} data-group="${groupName}" data-tbodyid="${groupName}HomeTable" class="date-days-button">
                                <h6>Casa</h6>
                            </button>
                            <button data-type=${TABLE_TYPES.AWAY} data-group="${groupName}" data-tbodyid="${groupName}AwayTable" class="date-days-button">
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
    const url=MAIN_SERVER+"/games/getCompetitionSeasonsSorted"
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
    const url =MAIN_SERVER+"/games/getCompetitionIdsWithGroup"
    return axios.get(url)
}

/**
 * Retrieves and renders top players based on market value and goals.
 */
function getTopPlayers() {
    const loadingSpinner= document.getElementById('loading-spinner');
    loadingSpinner.style.display = "block"; //add loading spinner
    Promise.all([
        getTopPlayersByMarketValue(),
        getTopPlayersByGoals(),
    ]).then(res => {
        renderTopPlayers(res[0].data, 'playersTopMarketValueContainer', PLAYER_CLASSIFIC_TYPOLOGIES.VALUE)
        renderTopPlayersByGoalWrapper(res[1].data,'playersTopGoalsContainer',PLAYER_CLASSIFIC_TYPOLOGIES.GOALS)
    }).catch(err => {
        console.error("There was an error trying to take top players",err)
    }).finally(()=>{ //removing loading spinner...
        loadingSpinner.style.display = "none";
    })
}

/**
 * Renders top players by goal
 * Start to load all the player images from Spring server and then
 * call the renderTopPlayers function
 * @param playersInfo an array of players that contains all the information
 * @param containerId the unique id of HTML top player leaderboard container
 * @param type the leaderbord type, could be GOAL or VALUE.
 */
function renderTopPlayersByGoalWrapper(playersInfo,containerId,type){
    const idList = playersInfo.map(item => item._id)
    axios.get(MAIN_SERVER+"/players/getPlayersImgUrlById", {
        params: {
            starting: idList.join(","),
        }
    }).then(imageRes => {
        const players = mergePlayersAndImage(playersInfo, imageRes.data.starting_lineup)
        renderTopPlayers(players, containerId, type)
    }).catch(err => {
        console.error("There was an error trying to take player image urls",err)
    })
}

/**
 * Merges player information with their images based on the
 * player unique identifier.
 * @param players an array of players who all have the unique id
 * @param images an array of object composed by image url and player id
 * @returns {*}
 */
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

/**
 * Retrieves top players by market value.
 * @returns {*}
 */
function getTopPlayersByMarketValue(){
    const url= `${MAIN_SERVER}/players/getPlayersByCompetitionAndLastSeasonSortedByValue/${competitionId}/${competitionSeasons[0]}` //default is last season
    return axios.get(url)
}

/**
 * Retrieves top players by goals.
 * @returns {*}
 */
function getTopPlayersByGoals(){
    const url= MAIN_SERVER+`/appearances/getTopScorer`
    return axios.get(url,{
        params:{
            comp_id:competitionId
        }
    })
}

/**
 * Renders the top players in a container.
 * there are two different rankings for players, specified by the type parameter
 * @param players array of all players who are part of the ranking
 * @param containerId unique identifier of the ranking container
 * @param type the type of ranking, can be VALUE or GOALS
 */
function renderTopPlayers(players,containerId,type){
    const playersContainer= document.getElementById(containerId)
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


/**
 * Renders the card for the first player in a ranking.
 * @param player an object that contains all the player's information
 * @param index the player's ranking position
 * @param type the type of ranking, can be VALUE or GOALS
 * @returns {HTMLDivElement} the player card
 */
function renderFirstPlayerCard(player,index,type){
    let playerCard= document.createElement('div');
    playerCard.className='player-stats-container-first';
    playerCard.setAttribute('data-playerid',player.playerId)
    playerCard.setAttribute('data-name',player.name)
    playerCard.setAttribute('data-imageurl',player.imageUrl)

    playerCard.innerHTML=
        `<h3>${index+1}° ${player.name}</h3>
        <div class="player-stats-first-img-container">
            <img src="${player.imageUrl}" alt="${player.name} image" class="player-stats-first-img">
            <div class="player-stats-goals-container">
                <h6>${type===PLAYER_CLASSIFIC_TYPOLOGIES.VALUE?player.marketValueInEur: player.total_goals}</h6>
                <h6>${type===PLAYER_CLASSIFIC_TYPOLOGIES.VALUE? 'EUR': 'Goals'}</h6>
            </div> 
        </div>`
    return playerCard
}

/**
 * Renders the card for all players except the first in the ranking
 * @param player an object that contains all the player's information
 * @param index the player's ranking position
 * @param type the type of ranking, can be VALUE or GOALS
 * @returns {HTMLDivElement} the player card
 */
function renderNormalPlayerCard(player,index,type){
    let playerCard= document.createElement('div');
    playerCard.setAttribute('data-playerid',player.playerId)
    playerCard.setAttribute('data-name',player.name)
    playerCard.setAttribute('data-imageurl',player.imageUrl)

    playerCard.className='player-stats-container';
    playerCard.innerHTML=
        `<h3>${index+1}°</h3>
         <img src="${player.imageUrl}" alt="${player.name} image" class="player-stats-img">
         <h6 class="player-name-in-card">${player.name}</h6>
         <h6>${type=== PLAYER_CLASSIFIC_TYPOLOGIES.VALUE ?player.marketValueInEur: player.total_goals}</h6>
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

/**
 * Retrieves the table data for a given competition, season, type, and optionally a group name.
 * @param compId the identifier of the competition whose table we want
 * @param season the season we are interested in
 * @param tableType the type of table, is a value between full, home and away
 * @param groupName the group whose ranking we want, in case the competition is with groups
 * @returns {*}
 */
export function getTable(compId,season,tableType, groupName){
    return axios.get(MAIN_SERVER+"/games/getTableByCompSeasonAndType",{
        params:{
            comp_id:compId,
            season:season,
            type:tableType,
            group:groupName
        }
    })
}

/**
 * Renders a table row with the provided data.
 * @param tableRowData an object representing all the data to put in the row
 * @param index the position in the table
 * @returns {HTMLTableRowElement} the tr element created
 */
export function renderTableRow(tableRowData,index){
    let tableRow=document.createElement('tr')
    tableRow.className=tableRowData.club_name!==null? 'squad-tr':'squad-tr-not-valid' //we want it to be possible to select the club, otherwise not
    tableRow.setAttribute('data-clubid',tableRowData._id)
    tableRow.setAttribute('data-name',tableRowData.club_name)
    tableRow.appendChild(renderTableTD(++index))
    tableRow.appendChild(renderTableTDWithLogo(tableRowData._id, tableRowData.club_name===null? 'N.D':tableRowData.club_name))
    let totalGames=tableRowData.wins+tableRowData.draws+tableRowData.loses
    tableRow.appendChild(renderTableTD(totalGames))
    tableRow.appendChild(renderTableTD(tableRowData.wins))
    tableRow.appendChild(renderTableTD(tableRowData.draws))
    tableRow.appendChild(renderTableTD(tableRowData.loses))
    tableRow.appendChild(renderTableTD(`${tableRowData.goals_scored}:${tableRowData.goals_taken}`))
    tableRow.appendChild(renderTableTD(tableRowData.points));
    return tableRow
}

/**
 * Renders a single table cell with the provided inner data.
 * @param tdInnerData a single information to put in the td
 * @returns {HTMLTableCellElement} the td just created.
 */
function renderTableTD(tdInnerData){
    let singleTd=document.createElement('td')
    singleTd.innerText=tdInnerData
    return singleTd
}

/**
 * Renders a table cell with a logo and name.
 * @param squadId the unique squad identifier
 * @param squadName the squad name
 * @returns {HTMLTableCellElement}
 */
function renderTableTDWithLogo(squadId,squadName){
    let singleTd=document.createElement('td')
    let container=document.createElement('div')
    container.className='career-squad'
    container.innerHTML=
        `<img src="${CLUB_LOGO_IMAGE_URL}${squadId}.png" alt="${squadName} logo" class="squadLogo">
         <p>${squadName}</p>          
        `
    singleTd.appendChild(container)
    return singleTd
}

/**
 * Retrieves clubs based on competition typology and renders them accordingly.
 */
function getClubsWrapper(){
    if(typology===COMPETITION_TYPOLOGIES.GROUP_CUP || typology===COMPETITION_TYPOLOGIES.CUP)
        getClubsDividedByGroup()
    else
        getClubs()
}

/**
 * Retrieves and render clubs divided by groups for the competition.
 */
function getClubsDividedByGroup(){
    const url=MAIN_SERVER+"/games/getClubsDividedByGroups"
    axios.get(url,{
        params:{
            competition_id:competitionId,
            season:competitionSeasons[0]
        }
    }).then(res=>{
        if(res.data!==0) {
            let clubs=res.data
            if(typology===COMPETITION_TYPOLOGIES.CUP) {
                clubs = unifyClubs(clubs)
                renderAllClubs(clubs)
            }else { //in questo caso devi mantenere solo i gruppi
                clubs = clubs.filter(group=>group.group.startsWith(GROUP_KEYWORD))
                renderClubsDividedByGroup(clubs)
            }
        }
    })
}

/**
 * Function that take a list of groups with duplicates and
 * return a list without duplicates
 * @param groups a list of groups with duplicates
 * @returns {any[]} a list of groups without duplicates.
 */
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

/**
 * Renders clubs divided by groups.
 * @param groups a list of groups, each group have clubs
 */
function renderClubsDividedByGroup(groups){
    let mainContainer= document.getElementById('competitionSquads')
    mainContainer.innerHTML=''
    groups.forEach(group=>{
        let groupContainer = renderGroup(group)
        mainContainer.appendChild(groupContainer)
    })
}

/**
 * Renders a group container with its associated clubs.
 * @param group
 * @returns {HTMLDivElement}
 */
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

/**
 * Retrieves clubs for the current competition in the
 * last season of competition and renders them.
 */
function getClubs(){
    const url=MAIN_SERVER+"/clubs/getByCompetitionAndSeason"
    axios.get(url, {
        params:{
            competition_id: competitionId,
            season:competitionSeasons[0] //take the last season by default
        }
    }).then(res=> {
        if(res.data.length!==0) {
            renderAllClubs(res.data)
        }
    }).catch(err=>{
        console.error("There was an error trying to take competitions clubs",err)
    })
}

/**
 * Renders all clubs that aren't undefined in the provided array.
 * @param clubs a list of clubs
 */
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

/**
 * Renders an HTML div card for a club that contains club name and image.
 * @param club a single club object with information related to club
 * @returns {HTMLDivElement} the club card
 */
function renderClubCard(club){
    let clubCard= document.createElement('div')
    clubCard.className='squad-card-mini'
    clubCard.setAttribute('data-clubId', club.clubId)
    clubCard.setAttribute('data-name', club.name)
    clubCard.innerHTML=
        `<img src="${CLUB_LOGO_IMAGE_URL}${club.clubId}.png" alt ="${club.name} logo" class="competition-big-logo"
          </img>
          <h5>${club.name}</h5>
        `
    return clubCard
}
/**
 * do the axios query to get all the current competition infos
 */
function getCompetitionInformation() {
    const url = MAIN_SERVER+"/competitions/getCompetitionInformation"
    return axios.get(url, {
        params:
            {"competition_id": competitionId}
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
    document.getElementById('competitionImage').setAttribute('src',COMPETITION_LOGO_IMAGE_URL+competitionInfo.competitionId.toLowerCase()+".png")
    document.getElementById('competitionNation').innerText=competitionInfo.countryName === null ? "Internazionale":competitionInfo.countryName;
    document.getElementById('competitionConfederation').innerText=competitionInfo.confederation
    document.getElementById('competitionType').innerText=competitionInfo.type
}

/**
 * get all the round numbers of the current competition in a certain season
 * @param season the season we are interested
 * @returns {*} an axios promise.
 */
function fetchAllRoundNumbers(season){
    let roundNumbersUrl=MAIN_SERVER+`/games/getRoundNumbers`
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
            if(typology===COMPETITION_TYPOLOGIES.GROUP_CUP)
                matchRounds=matchRounds.data.groupRounds
            else
                matchRounds=matchRounds.data.otherRounds
            renderMatchesDropdownMenu()
        }
        await getAndRenderGroupMatches(selectedSeason)
    }catch (e){
        console.error("There was an error trying to take group matches",e)
    }
}

/**
 * get all the seasons we have in our DB in which the competition was played
 * @returns {Promise<*>} an axios promise.
 */
async function fetchAllSeasons(){
    let seasonsUrl=MAIN_SERVER+'/games/getCompetitionSeasonsSorted'
    return axios.get(seasonsUrl,{
        params:{
            competition_id:competitionId
        }
    })
}

/**
 * Renders the season dropdown menu with the provided selector ID.
 * @param selectorId the unique identifier of the dropdown menu element
 */
function renderSeasonDropdownMenu(selectorId){
    let seasonsContainer= document.getElementById(selectorId)
    seasonsContainer.innerHTML=''
    competitionSeasons.forEach(season=>{
        let option= document.createElement('option')
        option.value= option.text=season;
        seasonsContainer.appendChild(option)
    })
}

/**
 * Retrieves and renders knockout matches for the selected season.
 * It is only called if the competition is a GROUP CUP or a CUP
 */
async function getKnockoutMatches(){
    if(competitionSeasons.length!==0) {
        competitionSeasons=await fetchAllSeasons()
        competitionSeasons=competitionSeasons.data
    }
    let season= document.getElementById('knockoutSeasonSelector').value
    if(currentKnockoutSeason!==season) {
        let rounds = await fetchAllRoundNumbers(season)
        knockoutRounds = rounds.data.otherRounds
        if(knockoutRounds.length===0) //se non ci sono dati allora la fase ad eliminazione diretta non è ancora cominciata, mostriamo un messaggio di errore
            document.getElementById('noKnockoutError').style.display='flex'
        else
            await getAllMatchesInKnockoutRounds(season)
    }
}

/**
 * Retrieves and renders group matches for the selected season.
 * @param season the season we are interested
 */
async function getAndRenderGroupMatches(season) {
    try {
        let matches = await getAllMatchesInRound(matchRounds[currentRound],season)
        renderMatchesRound(matches.data)
    } catch (e) {
        console.error("There was an error trying to get matches in a round",e)
    }
}

/**
 * Retrieves and renders all matches in knockout rounds for the selected season.
 * @param season the season we are interested
 * @returns {Promise<void>}
 */
async function getAllMatchesInKnockoutRounds(season){
    let container = document.getElementById('knockoutBody')
    container.innerHTML=''
    for(let round of knockoutRounds) {
        try {
            let matches = await getAllMatchesInRound(round,season)
            container.appendChild(renderKnockoutMatches(matches.data,round))
        }catch (err){
            console.error("There was an error trying to get all the matches in a round",err)
        }
    }
}

/**
 * Renders knockout matches for a specific round.
 * @param matches a list of matches in a round
 * @param round the current round
 * @returns {HTMLDivElement} the HTML matches container for the current round
 */
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

/**
 * Renders a single knockout match card.
 * @param match an object that contains information about a single match
 * @returns {HTMLDivElement} the HTML div match card.
 */
function renderSingleKnockoutMatch(match){
    let matchCard = document.createElement('div')
    matchCard.className='game-information'
    matchCard.setAttribute('data-gameId',match.game_id)
    matchCard.setAttribute('data-homeClubId',match.home_club_id)
    matchCard.setAttribute('data-awayClubId',match.away_club_id)
    matchCard.innerHTML=
        ` <div class="match-result-vertical">
                            <div class="squad-icon-container">
                                <img class="squad-icon" src="${CLUB_LOGO_IMAGE_URL}/${match.home_club_id}.png" alt="${match.home_club_name}" />
                                <p>${match.home_club_name !== undefined ? match.home_club_name : 'N.D.'}</p>
                                <div class="home-result">
                                    <p>${match.home_club_goals !== undefined ? match.home_club_goals : 'N.D.'}</p>
                                </div>
                            </div>
                            <div class="squad-icon-container">
                                <img class="squad-icon" src="${CLUB_LOGO_IMAGE_URL}/${match.away_club_id}.png" alt="${match.away_club_name}" />
                                <p> ${match.away_club_name !== undefined ? match.away_club_name : 'N.D.'}</p>
                                <div class="away-result">
                                    <p>${match.away_club_goals !== undefined ? match.away_club_goals : 'N.D.'}</p>
                                </div>
                            </div>
                        </div>`
    return matchCard
}
/**
 * function that get the next round if it's possibile
 * if there aren't any rounds, it's not possible to load the next and
 * the next button is disabled
 * Also enable the prev button if the round is > 0
 */
function getNextMatchday(season){
    if(currentRound!== matchRounds.length - 1) {
        currentRound++
        getAndRenderMatchesInRound(matchRounds[currentRound], season)
        if (currentRound === matchRounds.length - 1)
            document.getElementById('loadNextMatchday').className = 'btn-disabled';
        if(currentRound>0)
            document.getElementById('loadPrevMatchday').className='btn-choose-matchdays'
    }
}

/**
 * Retrieves and renders matches for the specified round and season.
 * @param round the round we are interested
 * @param season the season we are interested
 */
function getAndRenderMatchesInRound(round,season){
    getAllMatchesInRound(round,season)
        .then(res=>{
            renderMatchesRound(res.data)
            document.getElementById('competitionSelectMatchday').value=matchRounds[currentRound]
        })
        .catch(err=>{
            console.error("There was an error trying to get matches in a round", err)
        })
}
/**
 * Get the previous round if it's possibile
 * if there aren't any rounds, it's not possible to load the next and
 * the prev button is disabled
 * if current round is not the last, the next button is enabled!
 * @param season the season we are interested in
 */
function getPrevMatchday(season){
    if(currentRound!==0){
        currentRound--
        if(currentRound!==matchRounds.length-1)
            document.getElementById('loadNextMatchday').className='btn-choose-matchdays'
        if(currentRound===0)
            document.getElementById('loadPrevMatchday').className='btn-disabled'
        getAndRenderMatchesInRound(matchRounds[currentRound],season)
    }
}

/**
 * Get all the matches given a round and a season, that is
 * specified by matchRounds array in currentRound position
 * @param round the round we are interested in
 * @param season the season we are interested in
 */
function getAllMatchesInRound(round,season){
    const url=MAIN_SERVER+'/games/getMatchesByCompAndSeasonAndRound'
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
export function renderMatchesRound(matches){
    let matchesContainer=document.getElementById('competitionMatchesContainer')
    matchesContainer.innerHTML=''
    matches.forEach(match=>{
        adaptMatchDate(match)
        let singleMatchElement=document.createElement('div')
        singleMatchElement.className='single-horizontal-match'
        singleMatchElement.innerHTML=
            `
                <div class="date-and-season">
                    <h6>${match.round}</h6>
                    <h6>${match.date}</h6>
                </div>
                 <div class="squad-names-and-result-container">
                                <div class="squad-name-wrapper-home">
                                    <h6>${match.home_club_name === undefined? 'N.D' : match.home_club_name}</h6>
                                </div>
                                <img
                                        class="squadLogo"
                                        loading="lazy"
                                        alt="${match.home_club_name === undefined? 'N.D' : match.home_club_name} logo"
                                        src="${CLUB_LOGO_IMAGE_URL.concat(match.home_club_id)}.png"
                                />

                                <h6>${match.aggregate}</h6>
                                <img
                                        class="squadLogo"
                                        loading="lazy"
                                        alt="${match.away_club_name === undefined? 'N.D' : match.away_club_name}"
                                        src="${CLUB_LOGO_IMAGE_URL.concat(match.away_club_id)}.png"
                                />
                                <div class="squad-name-wrapper-away">
                                    <h6>${match.away_club_name === undefined? 'N.D' : match.away_club_name}</h6>
                                </div>
                            </div>
                            <button data-gameId="${match.game_id}" data-homeClubId="${match.home_club_id}" data-awayClubId="${match.away_club_id}" class='btn-load-match-details'>
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

