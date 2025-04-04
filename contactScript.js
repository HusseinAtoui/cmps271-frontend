// contact form code 
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.getElementById("contact-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    let isValid = true;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const number = document.getElementById("phone-number").value.trim();
    const message = document.getElementById("message").value.trim();

    // Clear old errors
    document.getElementById("invalid-name").textContent = "";
    document.getElementById("invalid-email").textContent = "";
    document.getElementById("invalid-number").textContent = "";
    document.getElementById("invalid-message").textContent = "";

    if (name === "") {
        isValid = false;
        document.getElementById("invalid-name").textContent = "Please input your Name";
    }
    if (email === "" || !emailPattern.test(email)) {
        isValid = false;
        document.getElementById("invalid-email").textContent = "Invalid Email";
    }
    const phonePattern = /^[0-9]{8,10}$/;

    if (number === "" || !phonePattern.test(number)) {
        isValid = false;
        document.getElementById("invalid-number").textContent = "Invalid Phone Number";
    }
    if (message === "") {
        isValid = false;
        document.getElementById("invalid-message").textContent = "Message Empty!";
    }

    if (!isValid) return;

    try {
        const res = await fetch("https://afterthoughts.onrender.comU/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, number, message }),
        });

        const result = await res.json();

        if (res.ok) {
            alert(result.message);
            document.getElementById("contact-form").reset();
        } else {
            alert("Error: " + result.error);
        }
    } catch (err) {
        console.error("Fetch error:", err);
        alert("Error sending message.");
    }
});
// newsletter form code 
document.getElementById("newsletter").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email-news").value.trim();
    const agree = document.getElementById("agree-box").checked;

    if (!email) {
        alert("Please enter an email address.");
        return;
    }

    if (!agree) {
        alert("You must agree to receive updates.");
        return;
    }

    try {
        const response = await fetch("https://afterthoughts.onrender.com/api/newsletter", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        
        });

        const data = await response.json();
        if (response.ok) {
            alert("Thank you for subscribing!");
            document.getElementById("newsletter").reset();
        } else {
            alert("Subscription failed: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while subscribing.");
    }
});

function signupUser() {
    console.log("signupUser function is called");
    const email = document.getElementById('signup-email').value;
    console.log("Email:", email);

    fetch("https://afterthoughts.onrender.com/api/newsletter/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to sign up");
        return response.json();
    })
    .then(data => {
        alert(data.message); // "Thank you for signing up!"
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to sign up.");
    });
}

/* =============================
   nav bar
   ============================= */

   const navbar = document.getElementById('navbar');

   function openSideBar() {
       navbar.classList.add('show');
   }
   
   function closeSideBar() {
       navbar.classList.remove('show');
   }