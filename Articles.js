console.log("🔥 Articles.js is running!");

const params = new URLSearchParams(window.location.search);
const articleId = params.get('id');

if (!articleId || articleId.length !== 24) {
  console.error("❌ Invalid or missing article ID in URL:", articleId);
  document.getElementById('article-section').innerHTML = "<p>Invalid article link.</p>";
  throw new Error("Stopping script due to invalid article ID.");
}

// ==============================
// HEART BUTTON FUNCTIONALITY
// ==============================
function setupHeartButton() {
  const heartBtn = document.getElementById('kudos-btn');
  const token = localStorage.getItem("authToken");

  // ✅ Extract article ID from the URL path
  const articleId = window.location.pathname.split("/").pop();
  console.log("🔑 Article ID from URL:", articleId);

  if (!heartBtn || !articleId) return;

  let isLiked = false;

  const checkLikeStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://afterthoughts.onrender.com/api/articles/${articleId}/like-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
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

    heartBtn.disabled = true;

    try {
      const endpoint = isLiked
        ? `https://afterthoughts.onrender.com/api/articles/${articleId}/unlike`
        : `https://afterthoughts.onrender.com/api/articles/${articleId}/like`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to update like status");

      isLiked = !isLiked;
      heartBtn.classList.toggle("liked");
    } catch (err) {
      console.error("Error updating like:", err);
    } finally {
      heartBtn.disabled = false;
    }
  });

  checkLikeStatus(); // initial call
}


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

            localStorage.removeItem(`article_${articleId}_comment`);
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
  });
  function renderRecommendedArticles(currentId) {
    fetch('https://afterthoughts.onrender.com/api/articles')
      .then(res => res.json())
      .then(allArticles => {
        const filtered = allArticles.filter(article => article._id !== currentId);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const recommended = shuffled.slice(0, 4);
  
        const container = document.getElementById('recommended-container');
        container.innerHTML = ""; // Clear previous content if any
  
        recommended.forEach(article => {
          const card = document.createElement('div');
          card.className = 'recommended-card';
          card.innerHTML = `
            <a href="Articles.html?id=${article._id}">
              <div class="card-image" style="background-image: url('${article.image}');"></div>
              <div class="card-text">
                <h4>${article.title}</h4>
                <p>${article.description || article.text.slice(0, 100)}...</p>
              </div>
            </a>
          `;
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error("❌ Error loading recommended articles:", err);
      });
  }
  
  
  // Call it after article is loaded
  renderRecommendedArticles(articleId);
  


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