
document.addEventListener('DOMContentLoaded',()=>{
    initLogin();
    getAllClubsByInitial();
});

/**
 * Get al server per tutti i club suddivisi in base al carattere iniziale
 */
function getAllClubsByInitial() {
    axios.get("http://localhost:3000/clubs/getAllClubsByInitial")
        .then(response => {
            renderClubsGroupedByInitial(response.data);
            let clubCards = document.querySelectorAll('#clubs-container .squad-card-mini')
            setAllClubButtonsListener(clubCards,null,null)//non conosciamo il competition name, dovremo fare una query per ottenerlo quando arriviamo in squadPage
        })
        .catch(error => {
            alert(error);
        });
}

/**
 * visualizzazione di tutte le squadre nella pagina suddivise per la lettera iniziale
 * @param clubsGrouped  hash map che ha lista di club che iniziano con la chiave, come valore e un carattere come chiave.
 */
function renderClubsGroupedByInitial(clubsGrouped) {
    let mainContainer = document.getElementById('clubs-container');
    mainContainer.innerHTML = '';

    for (const initial of Object.keys(clubsGrouped)) {
        const clubsGroup = document.createElement('div');
        clubsGroup.className = 'competitions-group';

        const header = document.createElement('div');
        header.className = 'competitions-group-header';
        header.innerHTML = `<h2>${initial}</h2>`;

        clubsGroup.appendChild(header);

        const clubsContainer = document.createElement('div');
        clubsContainer.className = 'competitions-group-container';

        clubsGrouped[initial].forEach(club => {
            const clubCard = document.createElement('div');
            clubCard.className = 'squad-card-mini';
            clubCard.setAttribute('data-clubId', club.clubId);
            clubCard.setAttribute('data-name', club.name);
            clubCard.setAttribute('data-stadiumname', club.stadiumName);
            clubCard.setAttribute('data-stadiumseats', club.stadiumSeats);
            clubCard.setAttribute('data-competitionid', club.domesticCompetitionId);
            clubCard.innerHTML = `
                <img class="competition-big-logo" src="https://tmssl.akamaized.net/images/wappen/head/${club.clubId}.png" alt="${club.name} logo">
                <h3>${club.name}</h3>
            `;
            clubsContainer.appendChild(clubCard);
        });
        clubsGroup.appendChild(clubsContainer);
        mainContainer.appendChild(clubsGroup);
    }
}

