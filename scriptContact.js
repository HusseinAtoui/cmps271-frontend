let isValid = true;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
document.getElementById("contact-form").addEventListener("submit",function(e){
    e.preventDefault();

const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const number = document.getElementById("phone-number").value.trim();
const message = document.getElementById("message").value.trim();


if(name === ""){
    isValid = false;
    document.getElementById("invalid-name").textContent = "Please input your Name";
    document.getElementById("invalid-name").style.display="block";
}
if(email === "" || !emailPattern.test(email)){
    isValid = false;
    document.getElementById("invalid-email").textContent = "Invalid Email";
    document.getElementById("invalid-email").style.display = "block";
}
const phonePattern = /^[0-9]{10}$/;
if(number ==="" || !phonePattern.test(number)){
    isValid = false;
    document.getElementById("invalid-number").textContent = "Invalid Phone Number";
    document.getElementById("invalid-number").style.display = "block";
}
if(message === ""){
    isValid = false;
    document.getElementById("invalid-message").textContent = "Message Empty !";
    document.getElementById("invalid-message").style.display = "block";
}
if(isValid){
    alert("Submitted Successfully!")
}
});
// newsletter 
document.getElementById("newsletter").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("email-news").value.trim();
    if(email === "" || !emailPattern.test(email)){
        isValid = false;
        document.getElementById("invalid-newsEmail").textContent = "Invalid Email";
        document.getElementById("invalid-newsEmail").style.display = "block";
    }
    if(isValid){
        alert("")
    }
})