const COUNTRY_NAME_INTERNATIONAL="Resto del mondo"
document.addEventListener('DOMContentLoaded',()=>{
    getCompetitionsGroupedByCountry()
    document.getElementById('search-competitions').addEventListener('input',(e)=>
        debouncedSearch(e.target.value)
    );
    const debouncedSearch = _.debounce(function (searchText){
        axios.get("http://localhost:3000/competitions/getCompetitionsGroupedByCountryAndLikeName",{
            params:{name:searchText}
        }).then(async res => {
            if (res.data.length !== 0) {
                await renderCompetitionsGroupedByCountry(res.data)
            }
        }).catch(err=>{
            alert(JSON.stringify(err))
        })
    },200)

document.addEventListener('DOMContentLoaded',()=>{
    getCompetitionsGroupedByCountry()
})

/**
 * send an axios query to get all the competitions in PG database
 * grouped by country name
 */
function getCompetitionsGroupedByCountry(){
    let url="http://localhost:3000/competitions/getCompetitionsGroupedByCountry"
    axios.get(url)
        .then(async res=>{
            await renderCompetitionsGroupedByCountry(res.data)
function getCompetitionsGroupedByCountry(){
    let url="http://localhost:3000/competitions/getCompetitionsGroupedByCountry"
    axios.get(url)
        .then(res=>{
            renderCompetitionsGroupedByCountry(res.data)
            setEventListeners()
        })
        .catch(err=>{
            alert(JSON.stringify(err))
        })
}

/**
 * render all the obtained competitions in the page
 * @param competitions hash map where a list of competitions is mapped basing on his name
 */
async function renderCompetitionsGroupedByCountry(competitions) {
    let mainContainer = document.getElementById('competitions-container');
    mainContainer.innerHTML = '';
    //itera per ogni Nazione
    for (const countryName of Object.keys(competitions)) {
        const competitionsGroup = document.createElement('div')
        let imgUrl
        competitionsGroup.className = 'competitions-group'
        if (countryName === COUNTRY_NAME_INTERNATIONAL)
            imgUrl = "images/worldImage.jpg"
        else {
            try {
                let queryUrl = `https://restcountries.com/v3.1/name/${countryName}`
                let res = await axios.get(queryUrl)
                imgUrl=res.data[0].flags.png
            }catch (err){
                imgUrl=null
            }
        }
        const header = `<div class="competitions-group-header">
                                <div class="header-flag-container">
                                    <img class="nationFlag" src=${imgUrl} alt="${countryName} flag">
                                </div>    
                                <h2>${countryName}</h2>
                            </div>`;
        competitionsGroup.innerHTML = header;

        const competitionsContainer = document.createElement('div')
        competitionsContainer.className = 'competitions-group-container'

        competitions[countryName].forEach(competition => {
            const competitionCard = document.createElement('div')
            competitionCard.className = 'competition-card-mini'
            competitionCard.setAttribute('data-competitionId', competition.competitionId)
            competitionCard.setAttribute('data-competitionName', competition.name)

            const cardContainer = `
                    <img class="competition-big-logo" src="${competitionLogoImgUrl}${competition.competitionId.toLowerCase()}.png">
                    <h3>${competition.name}</h3>
            `;
            competitionCard.innerHTML = cardContainer
function renderCompetitionsGroupedByCountry(competitions){
    let mainContainer = document.getElementById('competitions-container');
    mainContainer.innerHTML='';
    //itera per ogni Nazione
    Object.keys(competitions).forEach(countryName=>{
        const competitionsGroup = document.createElement('div')
        competitionsGroup.className='competitions-group'
        const header=`<div class="competitions-group-header">
                                <div class="header-flag-container">
                                </div>    
                                <h2>${countryName}</h2>
                            </div>`;
        competitionsGroup.innerHTML=header;

        const competitionsContainer = document.createElement('div')
        competitionsContainer.className='competitions-group-container'

        competitions[countryName].forEach(competition=>{
            const competitionCard= document.createElement('div')
            competitionCard.className='competition-card-mini'
            competitionCard.setAttribute('data-competitionId', competition.competitionId)

            const cardContainer=`
                    <img class="competition-big-logo" src="${competitionLogoImgUrl}${competition.competitionId.toLowerCase()}.png">
                    <h3>${competition.name}</h3>
            `;
            competitionCard.innerHTML=cardContainer
            competitionsContainer.appendChild(competitionCard)
        })
        competitionsGroup.appendChild(competitionsContainer)
        mainContainer.appendChild(competitionsGroup)
    }
    let competitionCards = document.querySelectorAll('.competition-card-mini')
    setCompetitionsCardEventListener(competitionCards)
    })
}

/**
 * set all competition-cards event listeners in order to go to the correct page
 */
function setEventListeners(){
    let competitionCards =document.querySelectorAll('.competition-card-mini')
    competitionCards.forEach(card=>{
        card.addEventListener('click',()=>{

        })
    })
}
