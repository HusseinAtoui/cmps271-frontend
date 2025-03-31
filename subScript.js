document.addEventListener("DOMContentLoaded", () => {
    setupStaticEventListeners();
    loadDynamicContent();
});

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

/* =============================
   Setup Static Button Listeners
   ============================= */

function setupStaticEventListeners() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log("Login button clicked");
        });
    }

    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            console.log("Submit button clicked");
        });
    }

    const joinBtn = document.querySelector('.join-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            console.log("Join membership button clicked");
        });
    }

    // Add event listeners for filtering and searching
    document.getElementById("categoryFilter").addEventListener("change", filterArticlesByTag);
    document.getElementById("searchInput").addEventListener("input", searchArticles);
}

/* =============================
   Load Dynamic Content
   ============================= */

async function loadDynamicContent() {
    await loadArticles();
}

/* =============================
   Load Articles
   ============================= */

async function loadArticles() {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = "";

    let articlesData;
    try {
        const response = await fetch('https://afterthoughts.onrender.com/api/articles/');
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

        // Format the date to a more user-friendly format
        const formattedDate = new Date(article.date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDateString = formattedDate.toLocaleDateString('en-US', options);

        const detailsP = document.createElement('p');
        detailsP.classList.add('details');
        detailsP.textContent = `${formattedDateString} | ${article.minToRead} min read`;

        const descriptionP = document.createElement('p');
        descriptionP.classList.add('description');
        descriptionP.textContent = article.description;

        const continueBtn = document.createElement('button');
        continueBtn.classList.add('continue-reading');
        continueBtn.textContent = "Continue reading";
        continueBtn.addEventListener('click', () => {
            window.location.href = `https://husseinatoui.github.io/cmps271-frontend/Articles.html?id=${article._id}`;
        });

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');

        // Creates a "share" button :)
        const shareBtn = document.createElement('button');
        shareBtn.classList.add('share-button');
        shareBtn.textContent = "Share";
        shareBtn.addEventListener('click', () => {
            if (!article._id) {
                alert("Error: Article ID is missing.");
                return;
            }

            const shareUrl = `${window.location.origin}/articles/${article._id}`;
            const shareText = `${article.title}\n${shareUrl}\n${article.description}`;

            if (navigator.share) {
                navigator.share({
                    title: article.title,
                    text: shareText,
                    url: shareUrl
                }).then(() => {
                    console.log("Shared successfully!");
                }).catch((error) => {
                    console.error("Error sharing:", error);
                });
            } else {
                alert("Web Share API is not supported in this browser.");
            }
        });

        const authorName = document.createElement('p');
        authorName.classList.add('authorname');
        authorName.textContent = article.author;

        // Append the title first, then the details below
        textSection.append(titleP, detailsP, descriptionP, buttonsDiv);
        buttonsDiv.append(continueBtn, shareBtn, authorName);
        card.append(imageContainer, textSection);
        gridContainer.appendChild(card);
    });
}

/* =============================
   Filter Articles by Tag (Fixed)
   ============================= */
async function filterArticlesByTag() {
    const selectedTag = document.getElementById("categoryFilter").value;

    console.log(`Selected Tag from Dropdown: ${selectedTag}`); // Log the selected tag

    if (selectedTag === "all") {
        return loadArticles();
    }

    try {
        const apiUrl = `https://afterthoughts.onrender.com/api/articles/tag/${encodeURIComponent(selectedTag)}`;
        console.log(`Fetching from: ${apiUrl}`); // Debug log: Ensure correct request

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch articles. Status: ${response.status}`);
        }

        const filteredArticles = await response.json();
        console.log(`Filtered Articles Response:`, filteredArticles); // Debugging log

        if (filteredArticles.length === 0) {
            document.querySelector('.grid-container').innerHTML = "<p>No articles found for this tag.</p>";
        } else {
            displayArticles(filteredArticles);
        }
    } catch (error) {
        console.error("Error fetching articles by tag:", error);
        document.querySelector('.grid-container').innerHTML = `<p>Error loading articles: ${error.message}</p>`;
    }
}



/* =============================
   Search Articles by Keyword
   ============================= */

async function searchArticles() {
    const query = document.getElementById("searchInput").value.toLowerCase();

    if (!query) {
        return loadArticles();
    }

    try {
        const response = await fetch('https://afterthoughts.onrender.com/api/articles/');
        if (response.ok) {
            let articles = await response.json();

            articles = articles.filter(article =>
                (article.title && article.title.toLowerCase().includes(query)) ||
                (article.author && article.author.toLowerCase().includes(query)) ||
                (article.text && article.text.toLowerCase().includes(query))
            );


            displayArticles(articles);
        } else {
            throw new Error("Response not ok");
        }
    } catch (error) {
        console.error("Error searching articles:", error);
    }
}
