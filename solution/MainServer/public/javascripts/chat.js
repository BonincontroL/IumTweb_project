const socket = io();
let myName = "";
let currentRoom ="";


/**
 * Inizializzazione di  chat_page.html
 */
function onChat(){
    myName = sessionStorage.getItem('username');
    getAllCompetitions();
    setupSendMessage();
    setupSocketListeners();


}

/**
 * Imposta i listeners per i socket
 */
function setupSocketListeners() {
    socket.on('chat message', (room,msg) => {
        insertMessage(msg,false);
    });

    socket.on('join conversation', (name, room) => {
        console.log(`${name} ha joinato in ${room}`);
    });
}

/**
 * Richiesta al server la lista di tutte le competizioni e richiamo di renderCompetitionOnChat per visualizzarle.
 */
function getAllCompetitions() {
    axios.get('http://localhost:3000/competitions/getAllCompetitions')
        .then(response => {
            const competitions = response.data;
            renderCompetitionOnChat(competitions);

            console.log(competitions);


        })
        .catch(error => {
            console.error('Si è verificato un errore durante la richiesta:', error);
        });
}

/**
 * Manipolazione  html per la corretta visualizzazione della  lista delle competizioni sia per i messaggi ricevuti che inviati
 * @param competitions lista di tutte le competizioni
 */
function renderCompetitionOnChat(competitions) {
    // Trova il container dove appendere i div delle competizioni
    const container = document.getElementById('lateral-navbar-chat-element-container');

    //Controllo per verificare che il container sia stato trovato
    if (!container) {
        console.error('Container per le competizioni non trovato.');
        return;
    }


    container.innerHTML = '';

    // Itera su ogni competizione per creare e appendere i div
    competitions.forEach(competition => {
        const id= competition.competitionId.toLowerCase();

        // Crea il div dell'elemento della chat
        const chatElement = document.createElement('div');
        chatElement.className = 'lateral-navbar-chat-element ';

        chatElement.setAttribute('data-competition-id', id);

        chatElement.addEventListener('click', function() {

            joinCompetitionRoom(competition);

        });

        // Crea il div per l'immagine
        const imgContainer = document.createElement('div');
        imgContainer.className = 'lateral-navbar-chat-element-img';

        // Crea l'immmagine e per ogni competizione viene messo il suo id nell 'url
        const image = document.createElement('img');
        image.src = `https://tmssl.akamaized.net/images/logo/header/${id}.png`;  // Usa l'URL del logo dalla competizione
        imgContainer.appendChild(image);

        // Crea il wrapper per l'header dell'elemento della chat
        const headerWrapper = document.createElement('div');
        headerWrapper.className = 'chat-header-element-wrapper';

        // Crea il div della riga dell'elemento della chat
        const row = document.createElement('div');
        row.className = 'chat-element-row';

        // Crea e imposta il titolo della competizione
        const title = document.createElement('h6');
        title.innerHTML = `<b>${competition.name}</b>`; // Usa il nome della competizione
        row.appendChild(title);

        // Assembla i div
        headerWrapper.appendChild(row);
        chatElement.appendChild(imgContainer);
        chatElement.appendChild(headerWrapper);

        // Appende il div della competizione al container
        container.appendChild(chatElement);
    });
}

/**
 * Richiamata quando si clicca su una competizione per unirsi alla chat
 * @param competition competizione su cui si ha cliccato
 */
function joinCompetitionRoom(competition) {
    myName=sessionStorage.getItem("username");
    if(currentRoom) {

        socket.emit('leave conversation', myName, currentRoom);
    }
    document.getElementById('chat-footer').style.display = 'flex';
    // Aggiorna la stanza corrente
    currentRoom = competition.competitionId;

    // Aggiorna il titolo della chat e l'immagine della stanza con il nome della competizione
    document.getElementById('chat_title').textContent = competition.name;
    // Costruisce l'URL dell'immagine basato sull'id della competizione e lo aggiorna
    const imageUrl = `https://tmssl.akamaized.net/images/logo/header/${competition.competitionId.toLowerCase()}.png`;
    document.querySelector('.chat-room-image').src = imageUrl;

    // Invia il nuovo room al server via Socket.IO
    socket.emit('join conversation', myName, competition.competitionId); // Usa l'ID come identificatore della room

    // Pulisci i messaggi precedenti dalla chat
    document.getElementById('messages-container').innerHTML = '';


}

/**
 * Invia il messaggio tramite socket al server e richiama insertMessage per visualizzarlo nella chat
 * @param message messaggio di testo da inviare
 */
function sendMessage(message) {
    myName=sessionStorage.getItem("username");
    const inputBox = document.getElementById('msg-input');
    if (message && currentRoom) {

        const msg = {
            room: currentRoom,
            message: message,
            name: myName,

        };

        // Invia il messaggio al server
        socket.emit('chat message',currentRoom, msg);


        insertMessage(msg, true);


        inputBox.value = '';
    }
}

/**
 * Inserisce il messaggio nella chat
 * @param msgData dati del messaggio(nome, messaggio)
 * @param isOwnMessage booleano per verificare se il messaggio è inviato o ricevuto
 */
function insertMessage(msgData, isOwnMessage) {
    const messagesContainer = document.getElementById('messages-container');

    const messageDiv = document.createElement('div');
    messageDiv.className = isOwnMessage ? 'message-container msg-right' : 'message-container msg-left';

    const singleMsgDiv = document.createElement('div');
    singleMsgDiv.className = 'single-msg';

    const msgHeader = document.createElement('p');
    msgHeader.className = 'msg-header';
    msgHeader.innerHTML = `<b>${msgData.name}</b>`;

    const msgText = document.createElement('p');
    msgText.className = 'msg-text';
    msgText.textContent = msgData.message;

    const msgHour = document.createElement('span');
    msgHour.className = 'msg-hour';
    msgHour.textContent = new Date().toLocaleTimeString();

    singleMsgDiv.appendChild(msgHeader);
    singleMsgDiv.appendChild(msgText);
    singleMsgDiv.appendChild(msgHour);

    messageDiv.appendChild(singleMsgDiv);
    messagesContainer.appendChild(messageDiv);

    // Scorri verso il basso per visualizzare il nuovo messaggio
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


/**
 * Aggiunge  listeners al pulsante di invio del messaggio
 */
function setupSendMessage() {
    const sendButton = document.getElementById('send_message');
    const inputBox = document.getElementById('msg-input');

    sendButton.addEventListener('click', function () {
        const message = inputBox.value.trim();
        if (message) {
            sendMessage(message);
            inputBox.value = '';
        }
    });

    inputBox.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Previene l'azione di default del tasto Enter
            const message = inputBox.value.trim();
            if (message) {
                sendMessage(message);
                inputBox.value = '';
            }
        }
    });


}


