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
        .then(res=>{
            renderCompetitionsGroupedByCountry(res.data)
            setCompetitionsCardEventListener(document.querySelectorAll('.competition-card-mini'))
        })
        .catch(err=>{
            alert(JSON.stringify(err))
        })
}

/**
 * render all the obtained competitions in the page
 * @param competitions hash map where a list of competitions is mapped basing on his name
 */
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
    })

}