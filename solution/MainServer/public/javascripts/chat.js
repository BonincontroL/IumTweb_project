const socket = io();
let myName = "";
let currentRoom ="";


/**
 * Initializes the chat page.
 */
function onChat(){
    myName = sessionStorage.getItem('username');
    getAllCompetitions();
    setupSendMessage();
    setupSocketListeners();
    document.getElementById('showLateralNavbarChat').addEventListener('click',()=>{
        document.querySelector('.lateral-navbar-for-chat').style.display='flex'
    })
}


/**
 * Sets up listeners for socket events.
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
 * Requests all competitions from the server and renders them on the chat interface.
 */
function getAllCompetitions() {
    axios.get('http://localhost:3000/competitions/getAllCompetitions')
        .then(response => {
            const competitions = response.data;
            renderCompetitionOnChat(competitions);
            let lateralChatButtons=document.querySelectorAll('.lateral-navbar-chat-element-container .lateral-navbar-chat-element')
            manageLateralChatButtons(lateralChatButtons)
        })
        .catch(error => {
            console.error('Si è verificato un errore durante la richiesta:', error);
        });
}

/**
 * Renders the competition list on the chat interface.
 * @param {Array} competitions - List of all competitions.
 */
function renderCompetitionOnChat(competitions) {

    const container = document.getElementById('lateral-navbar-chat-element-container');

    if (!container) {
        console.error('Container per le competizioni non trovato.');
        return;
    }
    container.innerHTML = '';


    competitions.forEach(competition => {
        const id= competition.competitionId.toLowerCase();


        const chatElement = document.createElement('div');
        chatElement.className = 'lateral-navbar-chat-element ';

        chatElement.setAttribute('data-competition-id', id);

        chatElement.addEventListener('click', function() {

            joinCompetitionRoom(competition);

        });


        const imgContainer = document.createElement('div');
        imgContainer.className = 'lateral-navbar-chat-element-img';


        const image = document.createElement('img');
        image.src = `https://tmssl.akamaized.net/images/logo/header/${id}.png`;  // Usa l'URL del logo dalla competizione
        imgContainer.appendChild(image);


        const headerWrapper = document.createElement('div');
        headerWrapper.className = 'chat-header-element-wrapper';


        const row = document.createElement('div');
        row.className = 'chat-element-row';

        const title = document.createElement('h6');
        title.innerHTML = `<b>${competition.name}</b>`; // Usa il nome della competizione
        row.appendChild(title);


        headerWrapper.appendChild(row);
        chatElement.appendChild(imgContainer);
        chatElement.appendChild(headerWrapper);


        container.appendChild(chatElement);
    });
}

/**
 * Called when clicking on a competition to join the chat.
 * @param {Object} competition - Clicked competition.
 */
function joinCompetitionRoom(competition) {
    myName=sessionStorage.getItem("username");
    if(currentRoom) {
        socket.emit('leave conversation', myName, currentRoom);
    }
    document.getElementById('chat-footer').style.display = 'flex';

    currentRoom = competition.competitionId;

    document.getElementById('chat_title').textContent = competition.name;

    const imageUrl = `https://tmssl.akamaized.net/images/logo/header/${competition.competitionId.toLowerCase()}.png`;
    document.querySelector('.chat-room-image').src = imageUrl;


    socket.emit('join conversation', myName, competition.competitionId); // Usa l'ID come identificatore della room
}

/**
 * Sends a message via socket to the server and calls insertMessage to display it in the chat.
 * @param {string} message - The text message to send.
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


        socket.emit('chat message',currentRoom, msg);

        insertMessage(msg, true);
        inputBox.value = '';
    }
}

/**
 * Inserts the message into the chat.
 * @param {Object} msgData - Message data (name, message).
 * @param {boolean} isOwnMessage - Boolean to indicate whether the message is sent or received.
 */
function insertMessage(msgData, isOwnMessage) {
    const messagesContainer = document.getElementById('messages-container-'+currentRoom.toLowerCase());

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


    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


/**
 * Adds listeners to the message send button.
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
            event.preventDefault();
            const message = inputBox.value.trim();
            if (message) {
                sendMessage(message);
                inputBox.value = '';
            }
        }
    });
}

/**
 * Manages lateral chat buttons behavior.
 * @param {NodeList} lateralbuttons - List of lateral chat buttons.
 */
function manageLateralChatButtons(lateralbuttons){
    lateralbuttons.forEach(button=>{
        button.addEventListener('click',()=>{
            lateralbuttons.forEach(btn=>{btn.classList.remove('chat-element-active')})
            button.classList.add('chat-element-active')
            hideAllMessagesContainers()
            let containerToShowId = 'messages-container-'+button.getAttribute('data-competition-id')
            let containerToShow=document.getElementById(containerToShowId)
            if(!containerToShow) {
                let mainContainer=document.getElementById('main-container')
                containerToShow=document.createElement('div')
                containerToShow.className='chat-messages-container'
                containerToShow.id=containerToShowId
                mainContainer.appendChild(containerToShow)
            }
            containerToShow.style.display = 'flex'
            if(window.innerWidth<800)
                document.querySelector('.lateral-navbar-for-chat').style.display='none'
        })
    })
}

/**
 * Hides all messages containers.
 */
function hideAllMessagesContainers(){
    let chatContainers= document.querySelectorAll('.chat-messages-container')
    chatContainers.forEach(container=>{container.style.display='none'})
}

