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
  fetchAndRenderRecommendations(articleId);

}
async function fetchAndRenderRecommendations(articleId) {
  try {
    const res = await fetch(`https://afterthoughts.onrender.com/api/articles/${articleId}/recommendations`);
    const data = await res.json();

    const container = document.getElementById('recommendations');
    container.innerHTML = "<h2>Recommended Articles</h2>";

    const grid = document.createElement('div');
    grid.className = 'recommendation-grid';

    data.recommendations.slice(0, 4).forEach(article => {
      const card = document.createElement('div');
      card.className = 'recommendation-card';

      card.innerHTML = `
        <div class="card-img" style="background-image: url('${article.image}')"></div>
        <div class="card-content">
          <h3>${article.title}</h3>
          <p>${article.description?.substring(0, 200)}...</p>
          <a href="Articles.html?id=${article._id}" class="read-btn">continue reading</a>
        </div>
      `;

      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch (err) {
    console.error("Failed to load recommendations:", err);
  }
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
}// Add these helper functions
function showError() {
  const errorDiv = document.getElementById('negative-comment-warning');
  errorDiv.style.display = 'block';
}

function closeError() {
  const errorDiv = document.getElementById('negative-comment-warning');
  errorDiv.style.display = 'none';
}