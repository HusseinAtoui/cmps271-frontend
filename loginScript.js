// first name, last name, email, pass, confirm pass, image box // for sign up

function registerNow() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "flex";
}

function goToLogin() {
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("signupForm").style.display = "none";
}
