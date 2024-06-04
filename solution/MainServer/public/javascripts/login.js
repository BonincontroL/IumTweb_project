/**
 * Initializes the login page called when the page is loaded.
 */
function onLogin(){
    showLoginForm();
    addListenersRegister()
    addListenersLogin()
}

/**
 * Adds listeners to the login and registration form buttons.
 */
function addListenersLogin(){
    document.getElementById("showSingupPage").addEventListener('click', showRegisterForm);
    document.getElementById('login_button').addEventListener('click', function (event) {
        event.preventDefault()
        const requestBody = extractDataLog();
        if (requestBody !== null) {
            sendDataLog(requestBody);
        }
        resetLoginForm();
    });
}

/**
 * Adds listeners to the registration form buttons.
 */
function addListenersRegister(){
    document.getElementById("showLoginPage").addEventListener('click', showLoginForm);
    document.getElementById('singUp_button').addEventListener('click', function(event) {
        event.preventDefault();
        const requestBody = extractDataReg();
        if (requestBody !== null) {
            sendDataReg(requestBody);
            showLoginForm();
        }
        resetRegisterForm();
    });
}

/**
 * Shows the login form and hides the registration form.
 */
function showLoginForm(event) {
    if (event) event.preventDefault();
    document.getElementById("singup_form").style.display = "none";
    document.getElementById("login_form").style.display = "flex";
}

/**
 * Shows the registration form and hides the login form.
 */
function showRegisterForm(event){
    if (event) event.preventDefault();
    document.getElementById("singup_form").style.display = "flex";
    document.getElementById("login_form").style.display = "none";
}



/**
 * Extracts data from the login form.
 * @returns {Object|null} - Data structure with form data if valid, otherwise returns null.
 */
function extractDataLog() {
    const formData = new FormData(document.getElementById('login_form'));
    const requestBody = Object.fromEntries(formData.entries());

    const email = requestBody['email'];
    if (!validateEmail(email)) {
        alert('Indirizzo email non valido');
        return null;
    }
    const password = requestBody['password'];
    if (!password) {
        alert('Password non può essere vuota');
        return null;
    }
    return requestBody;
}

/**
 * Extracts data from the registration form.
 * @returns {Object|null} - Data structure with form data if valid, otherwise returns null.
 */
function extractDataReg() {
    const formData = new FormData(document.getElementById('singup_form'));
    const requestBody = Object.fromEntries(formData.entries()); //trasforma i dati del form in un oggetto

    const email = requestBody['email'];
    if (!validateEmail(email)) {
        alert('Indirizzo email non valido');
        return null;
    }

    const username = requestBody['username'];
    const password = requestBody['password'];
    if (!username || !password) {
        alert('Username e/o password non possono essere vuoti');
        return null;
    }

    return requestBody;
}

/**
 * Resets the registration form.
 */
function resetRegisterForm() {
    document.getElementById('singup_form').reset();
}

/**
 * Resets the login form.
 */
function resetLoginForm() {
    document.getElementById('login_form').reset();
}


/**
 * Validates an email address.
 * @param {string} email - Email extracted from the form.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Sends registration data to the Server.
 * @param {Object} requestBody - Data structure with registration information.
 */
function sendDataReg(requestBody) {
    axios.post(MAIN_SERVER+'/users/register', requestBody)
        .then(response => {
            if (response.status === 201) {
                alert('Registrazione completata con successo');

            } else {
                console.error('Errore durante la registrazione:', response.data.message);
            }
        })
        .catch(error => {
            console.error('Errore durante la registrazione:', error);
            alert('Errore di registrazione: Username o email già in uso:');
        });
}


/**
 * Sends login data to the Server.
 * @param {Object} requestBody - Data structure with login information.
 */
function sendDataLog(requestBody){
    axios.post(MAIN_SERVER+'/users/login', requestBody)
        .then(response => {
            if (response.status === 200) {
                alert('Login completato con successo');
                const username = response.data.username;
                logged(username);
            } else {
                console.error('Errore durante il login:', response.data.message);
            }
        })
        .catch(error => {
            console.error('Errore durante il login:', error);
            alert('Errore di login: Username o password errati');
        });
}

/**
 * Saves the username in session storage and redirects to the landing page.
 * @param {string} username - The username.
 */
function logged(username){
    sessionStorage.setItem('username', username);
    window.location.href = 'landing_page.html';
}


/**
 * Function to set login on every page.
 */
function initLogin(){
    if (sessionStorage.getItem('username') !== null) {
        const user_icon= document.getElementById('user_icon');
        const user_popup=document.getElementById('user_popup');
        document.getElementById('doLogin').style.display = 'none';
        const chat_buttons = document.querySelectorAll(".chat_button");
        user_icon.style.display='flex';
        chat_buttons.forEach(chat_button=>{
            chat_button.style.display='flex'
        })

        document.addEventListener('click', function(event) {
            if(user_icon.contains(event.target)){
                user_popup.style.display = 'flex';
                document.getElementById('email_popup').innerText = sessionStorage.getItem('username');
                document.getElementById('logout').addEventListener('click', function(){
                    sessionStorage.removeItem('username');
                    window.location.href = 'landing_page.html';
                });
            }else if(!user_popup.contains(event.target)) {
                user_popup.style.display = 'none';
            }

        });

    } else {
        document.getElementById('doLogin').addEventListener('click', () => {
            window.location.href = "login_singup.html"
        }); //test poi da sistemare con l'html
    }
}

