// ✅ Determine API Base URL (for Local & Production)
const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:3000"  // Local development
    : "https://afterthoughts.onrender.com"; // Production

// ✅ Get userId from URL or localStorage
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userId") || localStorage.getItem("userId");

if (!userId) {
    alert("You need to log in first!");
    window.location.href = "loginPage.html"; // Redirect if not logged in
}

// ✅ Fetch User Profile Data
async function fetchUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data.");
        }

        const user = await response.json();
        document.querySelector(".dashboard-header h1").textContent = `Hi, ${user.firstName} ${user.lastName}`;
        document.querySelector(".dashboard-header p").textContent = `Ready to start your day with some articles?`;
        
        if (user.profilePicture) {
            document.querySelector(".header-image img").src = user.profilePicture;
        }

    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load profile. Redirecting to login.");
        window.location.href = "loginPage.html";
    }
}

// ✅ Fetch User Articles & Activity
async function fetchUserArticles() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/articles`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch articles.");
        }

        const articles = await response.json();
        const activitySection = document.querySelector(".recent-activity");
        activitySection.innerHTML = ""; // Clear existing content

        if (articles.length === 0) {
            activitySection.innerHTML = "<p>No recent articles published.</p>";
            return;
        }

        articles.forEach(article => {
            const articleItem = document.createElement("div");
            articleItem.classList.add("article-item");
            articleItem.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <p><strong>Views:</strong> ${article.views}</p>
                <a href="article.html?id=${article._id}">Read More</a>
            `;
            activitySection.appendChild(articleItem);
        });

    } catch (error) {
        console.error("Error fetching articles:", error);
    }
}

// ✅ Profile Button Click Redirect
document.querySelector(".nav-links a[href='profilepage.html']")?.addEventListener("click", function (e) {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (userId) {
        window.location.href = `profilepage.html?userId=${userId}`;
    } else {
        alert("Please log in first.");
        window.location.href = "loginPage.html";
    }
});

// ✅ Logout Function
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "loginPage.html"; // Redirect to login after logout
}

// ✅ Ensure Scripts Only Run Once
if (!window.profileScriptRun) {
    window.profileScriptRun = true;
    fetchUserProfile();
    fetchUserArticles();
}
