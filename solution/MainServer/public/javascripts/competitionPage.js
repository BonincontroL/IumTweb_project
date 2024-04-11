let lateralButtons
let matchButtons
const competitionPageName = 'competition-page'
let competition_id
let currentSeason = 2023 //la stagione corrente di default è 2023
let minMatchday, maxMatchday
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
 * this function start to get all
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

