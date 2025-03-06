// first name, last name, email, pass, confirm pass, image box // for sign up

function registerNow() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "flex";
}

function goToLogin() {
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("signupForm").style.display = "none";
}

document.getElementById("profileImage").addEventListener("change", function () {
    let file = this.files[0];
    if (file) {
        document.getElementById("fileName").textContent = file.name; // Show file name
    } else {
        document.getElementById("fileName").textContent = "No file chosen";
    }
});
