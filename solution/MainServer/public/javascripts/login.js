/**
 * Inizializza la pagina di login chiamata quando la pagina viene caricata
 */
function onLogin(){
    showLoginForm();



}

/**
 * Aggiunge i listener ai pulsanti del form di login e registrazione
 */
function addListenersLogin(){
    document.getElementById("showSingupPage").addEventListener('click', showRegisterForm);

    document.getElementById('login_button').addEventListener('click', function (event) {
        event.preventDefault()
        const requestBody = ExtractDataLog();
        console.log(requestBody); //da eliminare solo per vedere se stampa i dati
        if (requestBody !== null) {

        }
        resetLoginForm();
    });

}

/**
 * aggiunge i listener ai pulsanti del form di registrazione
 */
function addListenersRegister(){
    document.getElementById("showLoginPage").addEventListener('click', showLoginForm);

    document.getElementById('singUp_button').addEventListener('click', function(event) {
        event.preventDefault();
        const requestBody = ExtractDataReg();
        console.log(requestBody); // da eliminare solo per vedere se stampa
        if (requestBody !== null) {
            SendDataReg(requestBody);
        }
        resetRegisterForm();
    });


}



/**
 * mostra il form di login e nasconde il form di registrazione
 */
function showLoginForm(event) {
    if (event) event.preventDefault();

    document.getElementById("singup_form").style.display = "none";
    document.getElementById("login_form").style.display = "flex";
    addListenersLogin();
}

/**
 * mostra il form di registrazione e nasconde il form di login
 */
function showRegisterForm(event){
    if (event) event.preventDefault();
    document.getElementById("singup_form").style.display = "flex";
    document.getElementById("login_form").style.display = "none";
    addListenersRegister();
}



/**
 * Estrae i dati dal form di login
 * @returns requestBody struttura con i dati del form se son validi , se no ritorna null;
 * @constructor
 */
function ExtractDataLog() {
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
 * Estrae i dati dal form di registrazione
 * @returns requestBody struttura con i dati del form se son validi , se no ritorna null
 * @constructor
 */
function ExtractDataReg() {
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
 * Pulisce il form di registrazione

 */
function resetRegisterForm() {
    document.getElementById('singup_form').reset();
}

/**
 * Resetta il form di login
 */
function resetLoginForm() {
    document.getElementById('login_form').reset();
}



/**
 * regex per la validazione dell'email
 * @param email estratta dal form
 * @returns {boolean} true se l'email è valida, false altrimenti
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}



/**
 * Funzione per mandare i dati di registrazione al ExpressServer
 */
function SendDataReg(requestBody) {
    axios.post('http://localhost:3000/users/register', requestBody)
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