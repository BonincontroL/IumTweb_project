document.addEventListener('DOMContentLoaded',()=>{
    initLogin();
    getAllClubsByInitial();





});

/**
 * Get al server per tutti i club suddivisi in base al carattere iniziale
 */
function getAllClubsByInitial() {
    axios.get("http://localhost:3000/clubs/getAllClubsByInitial")
        .then(async response => {
            await renderClubsGroupedByInitial(response.data);
        })
        .catch(error => {
            alert(JSON.stringify(error));
        });
}

/**
 * visualizzazione di tutte le squadre nella pagina suddivise per la lettera iniziale
 * @param clubsGrouped  hash map che ha lista di club che iniziano con la chiave, come valore e un carattere come chiave.
 */
async function renderClubsGroupedByInitial(clubsGrouped) {
    let mainContainer = document.getElementById('competitions-container');
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

            const cardContent = document.createElement('div');
            cardContent.innerHTML = `
                <img class="competition-big-logo" src="https://tmssl.akamaized.net/images/wappen/head/${club.clubId}.png" alt="${club.name} logo">
                <h3>${club.name}</h3>
            `;

            clubCard.appendChild(cardContent);
            clubsContainer.appendChild(clubCard);
        });

        clubsGroup.appendChild(clubsContainer);
        mainContainer.appendChild(clubsGroup);
    }
}

