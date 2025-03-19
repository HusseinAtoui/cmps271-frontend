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
document.addEventListener("DOMContentLoaded", () => {
    // --- User Data & Authentication ---
    const userDataString = localStorage.getItem("userData");
    const token = localStorage.getItem("authToken");
    if (!userDataString || !token) {
      console.warn("User not logged in. Redirecting...");
      window.location.href = "login.html";
      return;
    }
    const userData = JSON.parse(userDataString);
    const userGreeting = document.getElementById("user-greeting");
    if (userGreeting) {
      userGreeting.textContent = `Hi, ${userData.firstName} ${userData.lastName}`;
    }
    const profileImage = document.getElementById("user-profile-image");
    if (profileImage) {
      profileImage.src = userData.profilePicture || "default-profile.jpeg";
    }
    
    // --- Fetch & Display Articles ---
    fetchArticles();
  
    // --- Stats & Chart Code ---
    // Sample articles data for chart demo; replace with your actual articles if needed
    const articlesData = [
      { title: "Article 1", month: "January", uniqueViews: 50, likes: 20, comments: 5 },
      { title: "Article 2", month: "January", uniqueViews: 40, likes: 15, comments: 8 },
      { title: "Article 3", month: "February", uniqueViews: 60, likes: 25, comments: 10 },
      { title: "Article 4", month: "March", uniqueViews: 70, likes: 30, comments: 12 },
      { title: "Article 5", month: "March", uniqueViews: 55, likes: 22, comments: 7 },
      { title: "Article 6", month: "April", uniqueViews: 80, likes: 35, comments: 15 }
    ];
  
    // Calculate overall totals
    const totalArticles = articlesData.length;
    const totalUniqueViews = articlesData.reduce((sum, art) => sum + art.uniqueViews, 0);
    const totalLikes = articlesData.reduce((sum, art) => sum + art.likes, 0);
    const totalComments = articlesData.reduce((sum, art) => sum + art.comments, 0);
  
    // Insert stat boxes into the dashboard-stats section
    const statsContainer = document.querySelector(".dashboard-stats");
    statsContainer.innerHTML = `
        <div class="stat-box" data-type="articles">Total Articles: ${totalArticles}</div>
        <div class="stat-box" data-type="uniqueViews">Total Unique Views: ${totalUniqueViews}</div>
        <div class="stat-box" data-type="popular">Total Likes: ${totalLikes}</div>
        <div class="stat-box" data-type="engagement">Total Comments: ${totalComments}</div>
    `;
  
    // Add click event listeners to stat boxes
    document.querySelectorAll(".stat-box").forEach(box => {
      box.addEventListener("click", function () {
        const statType = this.getAttribute("data-type");
        displayGraph(statType);
      });
    });
  
    // Function to display a graph inside #chartContainer
    function displayGraph(type) {
      // Sample x-axis values and datasets (you can adjust these using your articlesData)
      const xValues = [100,200,300,400,500,600,700,800,900,1000];
      let dataset1, dataset2, dataset3;
  
      if (type === "articles") {
        // Group by month (dummy data for demonstration)
        dataset1 = [2,3,4,3,5,4,3,2,1,0];
        dataset2 = [1,2,2,2,1,3,2,1,0,0];
        dataset3 = [0,1,0,2,1,1,0,1,2,1];
      } else if (type === "uniqueViews") {
        dataset1 = articlesData.map(article => article.uniqueViews);
        dataset2 = dataset1.map(val => val + 10);
        dataset3 = dataset1.map(val => val - 5);
      } else if (type === "popular") {
        dataset1 = articlesData.map(article => article.likes);
        dataset2 = dataset1.map(val => val + 5);
        dataset3 = dataset1.map(val => val - 2);
      } else if (type === "engagement") {
        dataset1 = articlesData.map(article => article.comments);
        dataset2 = dataset1.map(val => val + 3);
        dataset3 = dataset1.map(val => Math.floor(val / 2));
      }
  
      // Make sure the chart container is visible
      const chartDiv = document.getElementById("chartContainer");
      chartDiv.style.display = "block";
  
      // If a canvas with id "myChart" already exists, remove it before creating a new one
      let oldCanvas = document.getElementById("myChart");
      if (oldCanvas) {
        oldCanvas.parentNode.removeChild(oldCanvas);
      }
      // Create a new canvas element
      const newCanvas = document.createElement("canvas");
      newCanvas.id = "myChart";
      chartDiv.appendChild(newCanvas);
  
      // Destroy an existing chart instance if it exists (Chart.js 3+)
      if (window.myLineChart instanceof Chart) {
        window.myLineChart.destroy();
      }
  
      // Create the new chart (line chart example)
      const ctx = newCanvas.getContext("2d");
      window.myLineChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: xValues,
          datasets: [{
            data: dataset1,
            borderColor: "red",
            fill: false,
            label: "Dataset 1"
          },{
            data: dataset2,
            borderColor: "green",
            fill: false,
            label: "Dataset 2"
          },{
            data: dataset3,
            borderColor: "blue",
            fill: false,
            label: "Dataset 3"
          }]
        },
        options: {
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  });
  
  // Other functions (fetchArticles, displayArticles, toggleSettings, etc.)
  // are defined below as needed...
  document.addEventListener("DOMContentLoaded", () => {
    // Your existing chart code...

    // Close chart container when the close button is clicked
    const closeChartBtn = document.getElementById("closeChartBtn");
    closeChartBtn.addEventListener("click", () => {
        document.getElementById("chartContainer").style.display = "none";
    });
});
