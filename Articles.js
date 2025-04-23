

console.log("🔥 Articles.js is running!");
// ==============================

// ==============================
// RECOMMENDATIONS SYSTEM
// ==============================
function loadRecommendations(articleId) {
  const container = document.getElementById("recommendations");
  if (!container) return;

  fetch(`https://afterthoughts.onrender.com/api/articles/${articleId}/cached-recommendations`)
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => {
      container.innerHTML = '<h2 class="recommendations-title">Recommended Reads</h2>';
      
      if (data.recommendations?.length > 0) {
        renderRecommendations(data.recommendations);
      } else {
        showAlternativeSuggestions();
      }
    })
    .catch(err => {
      console.error("❌ Recommendation error:", err);
      showAlternativeSuggestions(true);
    });
}

function renderRecommendations(recommendations) {
  const container = document.getElementById("recommendations");
  const grid = document.createElement('div');
  grid.className = 'recommendation-grid';

  recommendations.forEach(rec => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <a href="Articles.html?id=${rec._id}" aria-label="${rec.title}">
        <img src="${rec.image}" alt="${rec.title}" loading="lazy">
        <div class="rec-content">
          <h3>${rec.title}</h3>
          <p>${rec.description?.slice(0, 100)}${rec.description?.length > 100 ? '...' : ''}</p>
          <div class="rec-meta">
            <span>${rec.minToRead} min read</span>
            <span>${rec.kudos?.length || 0} ❤️</span>
          </div>
        </div>
      </a>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function showAlternativeSuggestions(isError = false) {
  const container = document.getElementById("recommendations");
  container.innerHTML = `
    <div class="alt-recommendations ${isError ? 'error' : ''}">
      <h3>${isError ? 'Recommendations Currently Unavailable' : 'More Philosophical Explorations'}</h3>
      <div class="alt-grid">
        <a href="/tag/music" class="alt-card" aria-label="Browse music articles">
          <h4>All Music Articles</h4>
          <p>Explore philosophical analyses of musical forms</p>
        </a>
        <a href="/tag/art" class="alt-card" aria-label="Browse art articles">
          <h4>Art & Philosophy</h4>
          <p>Discover art's existential engagements</p>
        </a>
        <a href="/tags" class="alt-card" aria-label="Browse all topics">
          <h4>Browse All Topics</h4>
          <p>Explore diverse philosophical perspectives</p>
        </a>
      </div>
    </div>
  `;
}

// ==============================
// ADDITIONAL STYLES
// ==============================
const recommendationStyles = `
/* Recommendation grid styling */
.recommendation-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin-top: 1rem;
}

.rec-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.rec-card:hover {
  transform: translateY(-3px);
}

.rec-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
}

/* Alternative recommendations */
.alt-recommendations {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 10px;
  margin-top: 1rem;
}

.alt-recommendations.error {
  background: #ffe3e3;
  border: 1px solid #ffc9c9;
}

.alt-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.alt-card {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.alt-card:hover {
  transform: translateY(-3px);
  text-decoration: none;
}

.no-recs {
  text-align: center;
  padding: 2rem;
}
`;

// Inject styles
const styleTag = document.createElement('style');
styleTag.textContent = recommendationStyles;
document.head.appendChild(styleTag);

// ==============================
// INITIALIZATION
// ==============================

// ============================
// ==============================
// RENDER ARTICLE
// ==============================
function renderFullArticle({ title, author, text, image }) {
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
// RENDER COMMENT PROFILES
// ==============================
function makeProfile(profiles) {
  const allProfiles = document.getElementById("profile-contain");
  if (!allProfiles) return;
  allProfiles.innerHTML = '';

  profiles.forEach(profile => {
    const profileElement = document.createElement('div');
    profileElement.classList.add('profile-other-feedback');

    const profilePicDiv = document.createElement('div');
    profilePicDiv.classList.add('profile-pic');

    const profileImg = document.createElement('img');
    profileImg.src = profile.image;
    profileImg.alt = profile.name;
    profilePicDiv.appendChild(profileImg);

    const nameElement = document.createElement('h2');
    nameElement.textContent = profile.name;
    profilePicDiv.appendChild(nameElement);

    const profileCommentDiv = document.createElement('div');
    profileCommentDiv.classList.add('profile-comment');

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    const paragraph = document.createElement('p');
    paragraph.textContent = profile.comment;
    textDiv.appendChild(paragraph);

    profileCommentDiv.appendChild(textDiv);
    profileElement.append(profilePicDiv, profileCommentDiv);

    allProfiles.appendChild(profileElement);
  });
}
// ==============================
// COMMENT PERSISTENCE FUNCTIONALITY
// ==============================
function setupCommentPersistence(articleId) {
  const commentInput = document.getElementById("comment");
  const commentBtn = document.getElementById("comment-btn");
  
  if (!commentInput || !commentBtn) return;

  function loadComment() {
    const savedComment = localStorage.getItem(`article_${articleId}_comment`);
    if (savedComment !== null) {
      commentInput.value = savedComment;
    }
  }
  
  // Save comment to localStorage 
  function setupCommentAutoSave() {
    let saveTimeout;
    
    commentInput.addEventListener('input', function() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem(`article_${articleId}_comment`, commentInput.value);
      }, 500);
    });
  }
  
  // Clear saved comment
  function clearComment() {
    localStorage.removeItem(`article_${articleId}_comment`);
  }
  
  loadComment();
  setupCommentAutoSave();
   
  //removes local storage with commented
  commentBtn.addEventListener("click", () => {
    if (commentInput.value === "") {
      localStorage.removeItem(`article_${articleId}_comment`);
    }
  });
  
  // Add clear draft button
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.className = 'clear-comment-btn';
  clearBtn.addEventListener('click', () => {
    commentInput.value = '';
    clearComment();
  });
  
  commentBtn.insertAdjacentElement('afterend', clearBtn);
}
// ==============================
// LOAD ARTICLE FROM BACKEND
// ==============================
const params = new URLSearchParams(window.location.search);
const articleId = params.get('id');
console.log("🔑 Article ID from URL:", articleId);
setupCommentPersistence(articleId); 

fetch(`https://afterthoughts.onrender.com/api/articles/${articleId}`)
  .then(response => {
    if (!response.ok) throw new Error("Article not found");
    return response.json();
  })
  .then(article => {
    renderFullArticle({
      title: article.title,
      author: `${article.userID.firstName || "Unknown"} ${article.userID.lastName || ""}`,
      text: article.text,
      image: article.image
    });

    if (Array.isArray(article.comments)) {
      const formattedComments = article.comments.map(comment => ({
        name: comment.postedBy.firstName + " " + comment.postedBy.lastName,
        image: comment.postedBy.profilePicture,
        comment: comment.text
      }));

      document._existingComments = formattedComments;
      makeProfile(formattedComments);
    }
    setupHeartButton(articleId);


const commentBtn = document.getElementById("comment-btn");
const commentInput = document.getElementById("comment");

async function analyzeSentiment(commentInput) {

  // Trim and validate input
  const trimmedText = commentInput.trim();
  if (!trimmedText) {
      showError('Please enter some text to analyze');
      return;
  }

  try {
      const response = await fetch('https://afterthoughts.onrender.com/api/sentimentComments/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: trimmedText })
      });

      const sentimentMap = {
          'anger': 'negative',
          'disgust': 'negative',
          'fear': 'negative',
          'joy': 'positive',
          'neutral': 'neutral',
          'sadness': 'negative',
          'surprise': 'neutral'
      };

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generalSentiment = sentimentMap[data.sentiment.toLowerCase()] || 'neutral';

      alert(`Sentiment Analysis Result:\n
        Overall: ${generalSentiment.toUpperCase()}
        Emotion: ${data.sentiment}
        Confidence: ${(data.confidence * 100).toFixed(1)}%
        Processed Text: "${data.analyzedText}"`);
      

        return generalSentiment;
    
      } catch (error) {
        console.error("❌ Analysis Error:", error);
        return 'error';
      }
  }


// ----------------------------
    // ------------------------------
    // Comment Submission
    // ------------------------------

    if (commentBtn && commentInput) {
      commentBtn.addEventListener("click", async () => {
        console.log("Comment button clicked");

        const token = localStorage.getItem("authToken");
        const text = commentInput.value.trim();

        if (!token) {
          alert("🚩 You need to be logged in to comment.");
          window.location.href = "loginPage.html";
          return;
        }
        if (!text) {
          alert("✍️ Please write a comment before submitting.");
          return;
        }
        const generalSentiment = await analyzeSentiment(text);
  
        // Block negative comments
        if (generalSentiment === 'negative') {
          showError();
          return;
        }
        try {
          const response = await fetch("https://afterthoughts.onrender.com/api/articles/comment-article", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ articleId, text })
          });

          const data = await response.json();
          if (response.ok) {
            console.log("✅ Comment posted successfully:", data);


            // Retrieve the user data
            const userData = JSON.parse(localStorage.getItem("userData")) || {};
            const newComment = {
              name: `${userData.firstName || "Anonymous"} ${userData.lastName || ""}`,
              image: userData.profileImage || "default.png",
              comment: text
            };

            const existing = document._existingComments || [];
            const updated = [newComment, ...existing];

            document._existingComments = updated;
            makeProfile(updated);

            // Clear the input field
            commentInput.value = "";
          } else {
            // If unauthorized, inform the user
            if (response.status === 401) {
              alert("🚩 Unauthorized. Please log in again.");
              window.location.href = "loginPage.html";
            } else {
              alert(`⚠️ ${data.message}`);
            }
          }
        } catch (err) {
          console.error("❌ Error posting comment:", err);
        }
      });
    }
  })
  .catch(err => {
    console.error("❌ Error loading article:", err);
    document.getElementById('article-section').innerHTML = "<p>Could not load article.</p>";

  });// Set up the heart button functionality


  function setupHeartButton(articleId) {
    const heartBtn = document.getElementById('kudos-btn');
    const likeCountElement = document.getElementById('like-count');  // Element to display the like count
    const token = localStorage.getItem("authToken");
  
    if (!heartBtn || !articleId || !likeCountElement) return;
  
    let isLiked = localStorage.getItem(`liked_${articleId}`) === 'true';  // Retrieve the like status from localStorage
    let likesCount = parseInt(localStorage.getItem(`likeCount_${articleId}`), 10) || 0;  // Retrieve the like count from localStorage
  
    // Set the initial like count from localStorage
    likeCountElement.textContent = likesCount;
  
    // If the article is liked (based on localStorage), set the button state accordingly
    if (isLiked) {
      heartBtn.classList.add("liked");
    }
  
    heartBtn.addEventListener("click", async () => {
      if (!token) {
        alert("Please log in to like this article.");
        window.location.href = "loginPage.html";
        return;
      }
  
      // Toggle like status
      isLiked = !isLiked;
      heartBtn.classList.toggle("liked"); // Toggle the heart button visual state
      heartBtn.disabled = true;
  
      try {
        // Use the appropriate endpoint based on like status
        const endpoint = isLiked
          ? `http://localhost:3000/api/articles/${articleId}/add-like`
          : `http://localhost:3000/api/articles/${articleId}/remove-like`;
  
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId })
        });
  
        if (!response.ok) throw new Error("Failed to update like status");
  
        // Update the like count in localStorage
        likesCount = isLiked ? likesCount + 1 : likesCount - 1;
        localStorage.setItem(`likeCount_${articleId}`, likesCount);  // Store like count in localStorage
  
        // Update the UI with the new like count
        likeCountElement.textContent = likesCount;
  
        // Persist the like status in localStorage
        localStorage.setItem(`liked_${articleId}`, isLiked.toString());
      } catch (err) {
        console.error("Error updating like:", err);
        isLiked = !isLiked;
        heartBtn.classList.toggle("liked");
      } finally {
        heartBtn.disabled = false;
      }
    });    checkLikeStatus(); 
  }


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



// ==============================
// STYLES
// ==============================
const styles = `
  /* Recommendation styles */
  .recommendations-title {
    margin-bottom: 2rem;
    font-size: 1.8rem;
  }

  .recommendation-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .rec-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .rec-card:hover {
    transform: translateY(-5px);
  }

  .rec-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .rec-content {
    padding: 1.5rem;
  }

  /* Alternative recommendations */
  .alt-recommendations {
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 2rem 0;
  }

  .alt-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .alt-card {
    padding: 1.5rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s ease;
  }

  .alt-card:hover {
    transform: translateY(-3px);
  }
`;

// Inject styles
const styleTag = document.createElement('style');
styleTag.textContent = styles;
document.head.appendChild(styleTag);