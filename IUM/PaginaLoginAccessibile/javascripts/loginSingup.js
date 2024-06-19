function init(){
    showLoginForm()
    document.getElementById("showLoginPage").addEventListener('click', showLoginForm);
    document.getElementById("doLogin").addEventListener('click', showLoginForm);
    document.getElementById("showSingupPage").addEventListener('click', showRegisterForm);
    document.getElementById('singUp_button').addEventListener('click', function(event) {
        event.preventDefault();
        extractAndValidateDataReg();
    });
}
function showLoginForm(event) {
    if (event) event.preventDefault();
    document.getElementById("singup_form").style.display = "none";
    document.getElementById("login_form").style.display = "flex";
}
function showRegisterForm(event){
    if (event) event.preventDefault();
    document.getElementById("singup_form").style.display = "flex";
    document.getElementById("login_form").style.display = "none";
}
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function extractAndValidateDataReg() {
    const formData = new FormData(document.getElementById('singup_form'));
    const requestBody = Object.fromEntries(formData.entries()); //trasforma i dati del form in un oggetto

    const email = requestBody['email'];
    const username = requestBody['username'];
    const password = requestBody['password'];
    const name = requestBody['name']
    const surname= requestBody['surname'];
    if (!validateEmail(email)) {
        document.getElementById('email-error').style.display='block';
        return null;
    }else {
        document.getElementById('email-error-singup').style.display = 'none';
        document.getElementById('afterRegister').style.display='flex'
        document.getElementById('login_form').style.display='none'
        document.getElementById('singup_form').style.display='none'
    }
    return requestBody;
}