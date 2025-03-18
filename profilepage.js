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
