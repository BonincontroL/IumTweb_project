document.addEventListener('DOMContentLoaded',()=> {
    initLogin();
    manageEventDelegation()
    getAllClubsByInitial();
    document.getElementById('search-clubs').addEventListener('input', (e) =>
        debouncedSearch(e.target.value)
    );
    const debouncedSearch = _.debounce(function (searchText) {
        if (!searchText) {
            document.getElementById('popupNoContent').style.display = 'none'
            getAllClubsByInitial()
        }else {
            axios.get(MAIN_SERVER+"/clubs/getClubsGroupedByInitialAndLikeName", {
                params: {
                    name: searchText
                }

            })
                .then(res => {
                    if (res.data.length !== 0) {
                        document.getElementById('popupNoContent').style.display = 'none'
                        renderClubsGroupedByInitial(res.data)
                    } else {
                        document.getElementById('popupNoContent').style.display = 'flex'
                    }
                })
        }
    },300);
})

/**
 * Get al server per tutti i club suddivisi in base al carattere iniziale
 */
function getAllClubsByInitial() {
    axios.get(MAIN_SERVER+"/clubs/getAllClubsByInitial")
        .then(response => {
            renderClubsGroupedByInitial(response.data);
        })
        .catch(error => {
            console.error("There was an error trying to get all clubs by initial letter",error);
        });
}


/**
 * Renders all the clubs on the page grouped by initial character.
 * @param {Object} clubsGrouped - A hash map where a list of clubs is mapped based on their initial character.
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
            clubCard.setAttribute('data-clubid', club.clubId);
            clubCard.setAttribute('data-name', club.name);
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

