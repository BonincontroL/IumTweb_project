const COUNTRY_NAME_INTERNATIONAL="Internazionale"//=>Name of the international country.
const FLAG_NOT_FETCHABLE =["Scotland","England"]//=>Array of countries for which flag fetching is not possible.

/**
 * Initializes the page on DOMContentLoaded event.
 */
document.addEventListener('DOMContentLoaded',()=>{
    getCompetitionsGroupedByCountry()
    document.getElementById('search-competitions').addEventListener('input',(e)=>
        debouncedSearch(e.target.value)
    );

    /**
     * Debounced search function for competitions.
     */
    const debouncedSearch = _.debounce(function (searchText){
        if(!searchText){
            document.getElementById('popupNoContent').style.display='none'
            return;
        }
        axios.get("http://localhost:3000/competitions/getCompetitionsGroupedByCountryAndLikeName",{
            params:{name:searchText}
        }).then(async res => {
            if (res.data.length !== 0) {
                document.getElementById('popupNoContent').style.display='none'
                await renderCompetitionsGroupedByCountry(res.data)
            }else
                document.getElementById('popupNoContent').style.display='flex'

        }).catch(err=>{
            alert(JSON.stringify(err))
        })
    },200)
    initLogin();
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
        let imgUrl=await fetchFlag(countryName)
        let competitionsGroup= renderCompetitionsGroup(competitions,imgUrl,countryName)
        mainContainer.appendChild(competitionsGroup)
    }
    let competitionCards = document.querySelectorAll('.competition-card-mini')
    setCompetitionsCardEventListener(competitionCards)
}

/**
 * Renders competitions grouped by country.
 * @param {Object} competitions - A hash map where a list of competitions is mapped based on their name.
 * @param {string} imgUrl - The URL of the country's flag image.
 * @param {string} countryName - The name of the country.
 * @returns {HTMLDivElement} - The HTML element containing the competitions grouped by country.
 */
function renderCompetitionsGroup(competitions,imgUrl,countryName){
    const competitionsGroup = document.createElement('div')
    competitionsGroup.className = 'competitions-group'

    competitionsGroup.innerHTML = `<div class="competitions-group-header">
                                <div class="header-flag-container">
                                    <img class="nationFlag" src=${imgUrl} alt="${countryName} flag">
                                </div>    
                                <h2>${countryName}</h2>
                            </div>`;

    const competitionsContainer = document.createElement('div')
    competitionsContainer.className = 'competitions-group-container'

    competitions[countryName].forEach(competition => {
        competitionsContainer.appendChild(renderCompetitionCard(competition))
    })
    competitionsGroup.appendChild(competitionsContainer)
    return competitionsGroup
}

/**
 * Renders a competition card.
 * @param {Object} competition - The competition object.
 * @returns {HTMLDivElement} - The HTML element representing the competition card.
 */
function renderCompetitionCard(competition){
    const competitionCard = document.createElement('div')
    competitionCard.className = 'competition-card-mini'
    competitionCard.setAttribute('data-competitionId', competition.competitionId)
    competitionCard.setAttribute('data-competitionName', competition.name)
    competitionCard.setAttribute('data-competitionType', competition.type)
    competitionCard.innerHTML = `
                    <img class="competition-big-logo" src="${competitionLogoImgUrl}${competition.competitionId.toLowerCase()}.png">
                    <h3>${competition.name}</h3>
            `
    return competitionCard
}

/**
 * Fetches the flag image URL for a given country.
 * @param {string} countryName - The name of the country.
 * @returns {Promise<string|null>} - The URL of the flag image or null if not found.
 */
async function fetchFlag(countryName){
    let imgUrl ="images/defaultFlag.svg"

    if (countryName === COUNTRY_NAME_INTERNATIONAL)
        imgUrl = "images/worldImage.jpg" //immagine ad hoc nel caso degli internazionali
    else if(!FLAG_NOT_FETCHABLE.includes(countryName)){
        try {
            let queryUrl = `https://restcountries.com/v3.1/name/${countryName}`
            let res = await axios.get(queryUrl)
            imgUrl=res.data[0].flags.png
        }catch (err){
            alert(err)
            imgUrl=null
        }
    }
    return imgUrl
}