// Toggle to show the signup form and hide the login form
function registerNow() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "flex";
}

// Toggle to show the login form and hide the signup form
function goToLogin() {
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("signupForm").style.display = "none";
}

// Update file name display when a profile image is selected
document.getElementById("profileImage").addEventListener("change", function () {
    let file = this.files[0];
    document.getElementById("fileName").textContent = file ? file.name : "No file chosen";
});

// Function to show verification message if email is verified
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("verified") === "true") {
        alert("Your email has been verified! You can now log in.");
    }
};

// Signup form submission event listener
document.getElementById("signupFormElement").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Gather signup form field values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const profilePictureInput = document.getElementById("profileImage");
    const profilePicture = profilePictureInput.files[0];

    // Validate required fields
    let missingFields = [];
    if (!firstName) missingFields.push("First Name");
    if (!lastName) missingFields.push("Last Name");
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");
    if (!confirmPassword) missingFields.push("Confirm Password");

    if (missingFields.length > 0) {
        alert("Please fill in the following fields: " + missingFields.join(", "));
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Prepare FormData for signup request
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("bio", "I am an aftertinker");
    if (profilePicture) formData.append("profilePicture", profilePicture); // Only append if provided

    try {
        const response = await fetch("https://afterthoughts.onrender.com/api/auth/signup", {
            method: "POST",
            body: formData
        });
        const result = await response.json();

        if (result.status === "SUCCESS") {
            alert("Signup successful! Please check your email to verify your account.");
            window.location.href = "loginpage.html"; // Redirect to login page
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("An error occurred. Please try again.", error);
    }
});

// Login form submission event listener
document.getElementById("loginFormElement").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Gather login form field values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please fill in both the email and password fields.");
        return;
    }

    try {
        const response = await fetch("https://afterthoughts.onrender.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (result.status === "SUCCESS") {
            alert("Login successful!");

            // Save the token in localStorage
            localStorage.setItem("authToken", result.token);

            // Save user data in localStorage for profile page access
            localStorage.setItem("userData", JSON.stringify({
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                profilePicture: result.user.profilePicture || "default-profile.jpeg",
                email: result.user.email,
                bio: result.user.bio
            }));

            // Redirect to the profile page
            window.location.href = "profilepage.html";
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
    }
});
