document.addEventListener('DOMContentLoaded',()=>{
    getAllCompetitions()
})

/**
 * send an axios query to get all the competitions in PG database
 */
function getAllCompetitions(){
    let url="http://localhost:3000/competitions/getAllCompetitions"
    axios.get(url)
        .then(res=>{
            renderAllCompetitions(res.data)
        })
        .catch(err=>{
            alert(JSON.stringify(err))
        })
}

/**
 * render all the obtained competitions in the page
 * @param competitions competitions array obtained by the server
 */
function renderAllCompetitions(competitions){

}