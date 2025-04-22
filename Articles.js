console.log("🔥 Articles.js is running!");

// ==============================
// HEART BUTTON FUNCTIONALITY
// ==============================

function setupHeartButton(articleId) {
  const heartBtn = document.getElementById('kudos-btn');
  const token = localStorage.getItem("authToken");

  if (!heartBtn || !articleId) return;

  let isLiked = false;

  const checkLikeStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://afterthoughts.onrender.com/api/articles/${articleId}/like-status`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error("Failed to fetch like status");

      const data = await response.json();
      if (data.hasLiked) {
        isLiked = true;
        heartBtn.classList.add("liked");
      }
    } catch (err) {
      console.error("Error checking like status:", err);
    }
  };

  heartBtn.addEventListener("click", async () => {
    if (!token) {
      alert("Please log in to like this article.");
      window.location.href = "loginPage.html";
      return;
    }

    isLiked = !isLiked;
    heartBtn.classList.toggle("liked");
    heartBtn.disabled = true;

    try {
      const endpoint = isLiked
        ? 'https://afterthoughts.onrender.com/api/articles/add-like'
        : 'https://afterthoughts.onrender.com/api/articles/remove-like';

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
      });

      if (!response.ok) throw new Error("Failed to update like status");
    } catch (err) {
      console.error("Error updating like:", err);
      isLiked = !isLiked;
      heartBtn.classList.toggle("liked");
    } finally {
      heartBtn.disabled = false;
    }
  });

  checkLikeStatus();
}
// ==============================
// RENDER ARTICLE
// ==============================
function renderFullArticle({ title, author, text, image, articleId }) {
  const section = document.getElementById('article-section');
  if (!section) return;

  section.innerHTML = "";

  const h1 = document.createElement('h1');
  h1.className = 'article-title';
  h1.textContent = title;

  const h2 = document.createElement('h2');
  h2.className = 'author-title';
  h2.textContent = `by ${author}`;

  const pre = document.createElement('p');
  pre.className = 'text';
  pre.textContent = text;

  const articleLink = `https://husseinatoui.github.io/cmps271-frontend/Articles.html?id=${articleId}`;

  // MLA Citation
  const mlaCitation = `${author}. "${title}." Afterthoughts Philosophy Journal, ${articleLink}.`;
  
  // APA Citation
  const apaCitation = `${author} (${new Date().getFullYear()}). ${title}. Afterthoughts Philosophy Journal. Retrieved from ${articleLink}`;
  
  const citationContainer = document.createElement('div');
  citationContainer.className = 'citation-container';
  
  // Generate Citation Button
  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate Citation';
  generateBtn.className = 'cite-btn';
  
  const dropdown = document.createElement('div');
  dropdown.className = 'citation-dropdown';
  dropdown.style.display = 'none';
  
  const mlaOption = document.createElement('div');
  mlaOption.textContent = 'Copy MLA Citation';
  mlaOption.addEventListener('click', () => {
    navigator.clipboard.writeText(mlaCitation);
    alert('MLA Citation copied!');
    dropdown.style.display = 'none';
  });
  
  const apaOption = document.createElement('div');
  apaOption.textContent = 'Copy APA Citation';
  apaOption.addEventListener('click', () => {
    navigator.clipboard.writeText(apaCitation);
    alert('APA Citation copied!');
    dropdown.style.display = 'none';
  });
  
  dropdown.append(mlaOption, apaOption);
  
  // Toggle Dropdown Visibility
  generateBtn.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  
  citationContainer.append(generateBtn, dropdown);
  section.append(h1, h2, pre, citationContainer);
  
  const imageSection = document.querySelector('.image');
  if (imageSection && image) {
    imageSection.style.backgroundImage = `url("${image}")`;
    imageSection.style.backgroundSize = '100%';
    imageSection.style.backgroundPosition = 'center';
    imageSection.style.backgroundRepeat = 'no-repeat';
    imageSection.style.height = '400px';
  }
}

// ==============================
// RENDER RECOMMENDATIONS
// ==============================

function renderRecommendations(recommendations) {
  const recommendationsSection = document.getElementById('recommendations');
  recommendationsSection.innerHTML = ''; // Clear previous recommendations

  recommendations.forEach((recommendation) => {
    const articleDiv = document.createElement('div');
    articleDiv.classList.add('recommended-article-card');

    // Thumbnail image or placeholder if no image is available
    const image = document.createElement('img');
    image.src = recommendation.image || 'default-thumbnail.jpg';  // Placeholder for missing image
    image.alt = recommendation.title;
    image.classList.add('recommended-article-image');

    // Title of the recommended article
    const title = document.createElement('h3');
    title.classList.add('recommended-article-title');
    title.textContent = recommendation.title;

    // Short description (trimmed for preview)
    const description = document.createElement('p');
    description.classList.add('recommended-article-description');
    description.textContent = recommendation.description || 'No description available';

    // Link to the full article
    const link = document.createElement('a');
    link.href = `/articles.html?id=${recommendation._id}`; // Link to the recommended article
    link.classList.add('recommended-article-link');
    link.textContent = 'Read More';

    // Append image, title, description, and link to the card
    articleDiv.appendChild(image);
    articleDiv.appendChild(title);
    articleDiv.appendChild(description);
    articleDiv.appendChild(link);

    // Append the card to the recommendations section
    recommendationsSection.appendChild(articleDiv);
  });
}

// ==============================
// FETCH ARTICLE AND RECOMMENDATIONS
// ==============================

const params = new URLSearchParams(window.location.search);
const articleId = params.get('id');
console.log("🔑 Article ID from URL:", articleId);

// Fetch the article
fetch(`http://localhost:3000/api/articles/${articleId}`)
  .then(response => {
    if (!response.ok) throw new Error("Article not found");
    return response.json();
  })
  .then(article => {
    renderFullArticle({
      title: article.title,
      author: `${article.userID.firstName || "Unknown"} ${article.userID.lastName || ""}`,
      text: article.text,
      image: article.image,
      articleId: article._id
    });

    // Fetch the recommendations for the article
    fetch(`http://localhost:3000/api/articles/${articleId}/recommendations`)
      .then(response => response.json())
      .then(data => {
        renderRecommendations(data.recommendations);
      })
      .catch(error => {
        console.error('Error fetching recommendations:', error);
      });

    setupHeartButton(articleId);
  })
  .catch(err => {
    console.error("❌ Error loading article:", err);
    document.getElementById('article-section').innerHTML = "<p>Could not load article.</p>";
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
}// Add these helper functions
function showError() {
  const errorDiv = document.getElementById('negative-comment-warning');
  errorDiv.style.display = 'block';
}

function closeError() {
  const errorDiv = document.getElementById('negative-comment-warning');
  errorDiv.style.display = 'none';
}