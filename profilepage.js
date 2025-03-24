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

    const Adminpages = document.getElementById("Adminpages");
    const admins = document.getElementById("adminsection");
    const deleteAccBtn = document.getElementById("deleteAccBtn");
    const deleteSection = document.getElementById("deleteSection");
    const yesDeleteBtn = document.getElementById("yesDeleteBtn");
    const noDeleteBtn = document.getElementById("noDeleteBtn");
  
    if (!deleteAccBtn || !deleteSection || !yesDeleteBtn || !noDeleteBtn) {
      console.error("One or more delete account elements not found.");
      return;
    }
  
    // Toggle the delete confirmation section when the delete account button is clicked
    deleteAccBtn.addEventListener("click", function () {
      deleteSection.style.display = (deleteSection.style.display === "block") ? "none" : "block";
    })

    if (!Adminpages || !admins) {
        console.error('Admin button or adminsection not found!');
        return; // If elements are missing, exit early
    }

    // Ensure that the admin section is initially hidden
    admins.style.display = "none"; 

    // Toggle admin section visibility when Admin button is clicked
    Adminpages.addEventListener("click", function () {
        if (admins.style.display === "block") {
            admins.style.display = "none";
        } else {
            admins.style.display = "block";
        }
    });
    changeBioBtn.addEventListener("click", function () {
        bioSection.style.display = bioSection.style.display === "block" ? "none" : "block";
    });
    // Save new bio
    saveBioBtn.addEventListener("click", async function () {
        const bio = bioInput.value;
        try {
          const response = await fetch("http://localhost:3000/api/auth/change-bio", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("authToken")}`
            },
            body: JSON.stringify({ bio })
          });
          
          // Verify response content-type to avoid JSON parse errors
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();
            if (result.status === "SUCCESS") {
              alert("Bio updated successfully!");
              // Optionally update localStorage or UI with new bio
            } else {
              alert("Error: " + result.message);
            }
          } else {
            // If not JSON, get text for debugging
            const errorText = await response.text();
            console.error("Unexpected response:", errorText);
            alert("An unexpected error occurred while updating your bio.");
          }
        } catch (error) {
          console.error("Error updating bio:", error);
          alert("An error occurred while updating your bio.");
        }
      });
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
    
        // Create a FormData object to hold the file
        const formData = new FormData();
        formData.append("profilePicture", file);
    
        try {
          // Send the request to update profile picture
          const response = await fetch("http://localhost:3000/api/auth/change-pfp", {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("authToken")}`
              // Do not set "Content-Type" header for FormData; the browser will set it automatically.
            },
            body: formData
          });
    
          // Check if response is JSON by inspecting the header
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();
            if (result.status === "SUCCESS") {
              // Update the profile picture in the UI (if you have an img element with id "user-profile-image")
              document.getElementById("user-profile-image").src = result.user.profilePicture;
              alert("Profile picture updated successfully!");
              picSection.style.display = "none"; // Optionally hide the upload section
            } else {
              alert("Error: " + result.message);
            }
          } else {
            const errorText = await response.text();
            console.error("Unexpected response:", errorText);
            alert("An unexpected error occurred while updating your profile picture.");
          }
        } catch (error) {
          console.error("Error updating profile picture:", error);
          alert("An error occurred while updating your profile picture.");
        }
    });

      
        // Confirm account deletion
 yesDeleteBtn.addEventListener("click", async function () {
          try {
            const response = await fetch("http://localhost:3000/api/auth/delete-account", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`
              }
            });
            const result = await response.json();
            if (response.ok) {
              alert("Your account has been deleted successfully.");
              // Clear any stored user data
              localStorage.removeItem("authToken");
              localStorage.removeItem("userData");
              // Redirect to homepage or login page as desired
              window.location.href = "index.html";
            } else {
              alert(result.message || "Failed to delete account");
            }
          } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting your account.");
          }
        });
      
        // Cancel deletion and hide confirmation dialog
        noDeleteBtn.addEventListener("click", function () {
          deleteSection.style.display = "none";
        });


logoutBtn.addEventListener("click", async function () {
        try {
          const response = await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("authToken")}`
            }
          });
          
          if (response.ok) {
            // Clear the authentication token and redirect to login page
            localStorage.removeItem("authToken");
            window.location.href = "loginPage.html";
          } else {
            const result = await response.json();
            alert("Logout failed: " + (result.message || "Please try again."));
          }
        } catch (error) {
          console.error("Logout error:", error);
          alert("An error occurred during logout.");
        }
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
  
    function displayGraph(type) {
        // Dummy x-axis values (for example, days or months)
        const xValues = [1,2,3,4,5,6,7,8,9,10];
        let dataSet;
        // Set dummy datasets based on the type clicked
        if (type === "articles") {
          dataSet = [1,2,1,3,2,4,3,5,4,6];
        } else if (type === "uniqueViews") {
          dataSet = [10,20,30,40,50,60,70,80,90,100];
        } else if (type === "popular") {
          dataSet = [5,5,6,7,8,8,9,10,10,11];
        } else if (type === "engagement") {
          dataSet = [2,3,2,4,3,5,3,6,4,7];
        }
        

        // Ensure the chart container is visible
        const container = document.getElementById("chartContainer");
        container.style.display = "block";
        // Clear any existing content in the container
        container.innerHTML = "";
        // Create a new canvas element for the chart
        const canvas = document.createElement("canvas");
        canvas.id = "chartCanvas";
        container.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        // Create the chart using Chart.js (line chart example)
        new Chart(ctx, {
          type: "line",
          data: {
            labels: xValues,
            datasets: [{
              label: `${type} Chart`,
              data: dataSet,
              borderColor: "#7D0C0E",
              fill: false
            }]
          },
          options: {
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    });
  // Other functions (fetchArticles, displayArticles, toggleSettings, etc.)
  // are defined below as needed...
document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleScheduler');
    const schedulerDiv = document.getElementById('scheduler');
  
    toggleButton.addEventListener('click', function () {
      // Toggle the scheduler's visibility
      if (schedulerDiv.style.display === "none" || schedulerDiv.style.display === "") {
        schedulerDiv.style.display = "block";
      } else {
        schedulerDiv.style.display = "none";
      }
    });
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.getElementById('scheduleForm');
    const responseMessage = document.getElementById('responseMessage');
  
    scheduleForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      // Gather form data
      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        meetingDate: document.getElementById('meetingDate').value,
        message: document.getElementById('message').value
      };
  
      try {
        // Send POST request to the backend endpoint
        const response = await fetch('http://localhost:3000/api/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        const result = await response.json();
  
        // Display message from the backend
        responseMessage.textContent = result.message || result.error;
  
        // Reset the form on success
        if (response.ok) {
          scheduleForm.reset();
        }
      } catch (error) {
        console.error('Error:', error);
        responseMessage.textContent = `Error: ${error.message}`;
      }
    });
  });