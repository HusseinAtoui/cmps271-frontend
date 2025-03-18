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

// Function to fetch articles from the backend API
function fetchArticles() {
    fetch("/api/articles", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
    })
    .then(response => response.json())
    .then(articles => {
        const activitySection = document.querySelector(".recent-activity");
        activitySection.innerHTML = ""; // Clear existing content

        articles.forEach(article => {
            const preview = article.content.split("\n").slice(0, 3).join("<br>");
            const wordCount = article.content.split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 225);

            let articleCard = document.createElement("div");
            articleCard.classList.add("activity-card");
            articleCard.innerHTML = `
                <img class="images" src="${article.image || 'default.jpg'}" alt="${article.title}">
                <div class="activity-info">
                    <h3>${article.title}</h3>
                    <p>${preview}</p>
                    <span>${readingTime} minute${readingTime === 1 ? '' : 's'}</span>
                </div>
            `;

            // Open modal on click
            articleCard.addEventListener("click", function () {
                openModal(article.title, article.content, article.image || "default.jpg");
            });

            activitySection.appendChild(articleCard);
        });
    })
    .catch(error => console.error("Error fetching articles:", error));
}

// Function to open the article modal
function openModal(title, content, imageSrc) {
    const modal = document.getElementById("article-modal");
    const modalContent = document.getElementById("modal-content");

    modalContent.innerHTML = `
        <button id="modal-close" style="position:absolute;top:10px;right:10px;padding:5px 10px;cursor:pointer;border-radius:20px;border:none;background-color:#f0c5a4;">Close</button>
        <img src="${imageSrc}" alt="${title}" style="width:100%; border-radius:10px; margin-bottom:10px;">
        <h2>${title}</h2>
        <p>${content}</p>
    `;

    modal.style.display = "flex";

    // Close modal on button click
    document.getElementById("modal-close").addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close modal when clicking outside content
    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}
