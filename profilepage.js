document.addEventListener('DOMContentLoaded', function () {
    const userDataString = localStorage.getItem("userData");
    const token = localStorage.getItem("authToken");

    if (!userDataString || !token) {
        console.warn("User not logged in. Redirecting...");
        window.location.href = "login.html";
        return;
    }

    const userData = JSON.parse(userDataString);

    // Update the greeting
    const userGreeting = document.getElementById("user-greeting");
    if (userGreeting) {
        userGreeting.textContent = `Hi, ${userData.firstName} ${userData.lastName}`;
    }

    // Update the profile image
    const profileImage = document.getElementById("user-profile-image");
    if (profileImage) {
        profileImage.src = userData.profilePicture || "default-profile.jpeg";
    }

       // Fetch and display articles from the backend
       fetchArticles();
    });
    
    async function fetchArticles() {
        const gridContainer = document.querySelector('.grid-container');
        gridContainer.innerHTML = "";
    
        let articlesData;
        try {
            const response = await fetch('http://localhost:3000/api/articles');
            if (response.ok) {
                articlesData = await response.json();
            } else {
                throw new Error("Response not ok");
            }
        } catch (error) {
            console.error("Error loading articles from backend:", error);
            articlesData = [];
        }
    
        displayArticles(articlesData);
    }

/* =============================
   Display Articles
   ============================= */
   function displayArticles(articles) {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = "";

    if (articles.length === 0) {
        gridContainer.innerHTML = "<p>No articles found.</p>";
        return;
    }

    articles.forEach(article => {
        const card = document.createElement('div');
        card.classList.add('card');

        const imageContainer = document.createElement('div');
        imageContainer.classList.add('imagecontainer');
        if (article.image) {
            const img = document.createElement('img');
            img.src = article.image;
            img.alt = article.title;
            imageContainer.appendChild(img);
        }

        const textSection = document.createElement('div');
        textSection.classList.add('text-section');

        const titleP = document.createElement('p');
        titleP.classList.add('title');
        titleP.textContent = article.title;

        // Format the date into a user-friendly format
        const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const detailsP = document.createElement('p');
        detailsP.classList.add('details');
        // Display date and minToRead below the title
        detailsP.textContent = `${formattedDate} | ${article.minToRead} min read`;

        const descriptionP = document.createElement('p');
        descriptionP.classList.add('description');
        descriptionP.textContent = article.description;

        const continueBtn = document.createElement('button');
        continueBtn.classList.add('continue-reading');
        continueBtn.textContent = "Continue reading";
        continueBtn.addEventListener('click', () => {
            window.location.href = `/articles/${article._id}`;
        });

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');

        const authorName = document.createElement('p');
        authorName.classList.add('authorname');
        authorName.textContent = article.author;

        buttonsDiv.append(continueBtn, authorName);
        textSection.append(titleP, detailsP, descriptionP, buttonsDiv);
        card.append(imageContainer, textSection);
        gridContainer.appendChild(card);
    });
}
// Function to toggle the visibility of the settings div
function toggleSettings() {
    var settingsDiv = document.getElementById('settings-div');
    // Toggle display between 'none' and 'block'
    if (settingsDiv.style.display === "none" || settingsDiv.style.display === "") {
        settingsDiv.style.display = "block";
    } else {
        settingsDiv.style.display = "none";
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const changeBioBtn = document.getElementById("changeBioBtn");
    const bioSection = document.getElementById("bioSection");
    const bioInput = document.getElementById("bioInput");
    const saveBioBtn = document.getElementById("saveBioBtn");

    const changePicBtn = document.getElementById("changePicBtn");
    const picSection = document.getElementById("picSection");
    const picInput = document.getElementById("picInput");
    const savePicBtn = document.getElementById("savePicBtn");

    const logoutBtn = document.getElementById("logoutBtn");

    // Toggle bio input display
    changeBioBtn.addEventListener("click", function () {
        bioSection.style.display = bioSection.style.display === "block" ? "none" : "block";
    });

    // Save new bio
    saveBioBtn.addEventListener("click", async function () {
        const newBio = bioInput.value.trim();
        if (!newBio) {
            alert("Bio cannot be empty!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/account/updateBio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({ bio: newBio })
            });

            if (response.ok) {
                alert("Bio updated successfully!");
                document.getElementById("user-greeting").textContent = `Hi, ${newBio}`;
                bioSection.style.display = "none";
            } else {
                alert("Failed to update bio.");
            }
        } catch (error) {
            console.error("Error updating bio:", error);
            alert("An error occurred while updating your bio.");
        }
    });

    // Toggle profile picture upload section
    changePicBtn.addEventListener("click", function () {
        picSection.style.display = picSection.style.display === "block" ? "none" : "block";
    });

    // Save new profile picture
    savePicBtn.addEventListener("click", async function () {
        const file = picInput.files[0];
        if (!file) {
            alert("Please select a picture.");
            return;
        }

        const formData = new FormData();
        formData.append("profilePicture", file);

        try {
            const response = await fetch("http://localhost:3000/account/updateProfilePic", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById("user-profile-image").src = data.profilePicUrl;
                alert("Profile picture updated successfully!");
                picSection.style.display = "none";
            } else {
                alert("Failed to update profile picture.");
            }
        } catch (error) {
            console.error("Error updating profile picture:", error);
            alert("An error occurred while updating your profile picture.");
        }
    });


    // --- Delete Account ---
    deleteAccBtn.addEventListener("click", function () {
        deleteSection.style.display = "block";
        bioSection.style.display = "none";
        picSection.style.display = "none";
    });

    yesDeleteBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("http://localhost:3000/account/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert("Your account has been deleted.");
                window.location.href = "index.html"; // Adjust the redirect as needed
            } else {
                alert(data.message || "Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting account.");
        }
    });

    noDeleteBtn.addEventListener("click", function () {
        deleteSection.style.display = "none";
    });


    // Logout function
    logoutBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("http://localhost:3000/account/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.ok) {
                localStorage.removeItem("authToken");
                window.location.href = "loginPage.html";
            } else {
                alert("Failed to logout.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout.");
        }
    });
});
