
console.log("🔥 Articles.js is running!");

// ==============================
// RENDER ARTICLE
// ==============================
function renderFullArticle({ title, author, text, image }) {
  const section = document.getElementById('article-section');
  if (!section) return;

  section.innerHTML = "";

  const h1 = document.createElement('h1');
  h1.className = 'title';
  h1.textContent = title;

  const h2 = document.createElement('h2');
  h2.textContent = `by ${author}`;

  const pre = document.createElement('p');
  pre.className = 'text';
  pre.textContent = text;

  section.classList.add('article');
  section.append(h1, h2, pre);

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
// LOAD ARTICLE FROM BACKEND
// ==============================
const params = new URLSearchParams(window.location.search);
const articleId = params.get('id');
console.log("🔑 Article ID from URL:", articleId);

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

// ------------------------------
// Heart Button Functionality (Private Like Tracking)
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const heartBtn = document.getElementById('kudos-btn');
  const articleId = new URLSearchParams(window.location.search).get('id');
  const token = localStorage.getItem("authToken");

  if (!heartBtn || !articleId) return;

  let isLiked = false;

  // Optionally preload like state
  (async () => {
    if (token) {
      try {
        const res = await fetch(`https://afterthoughts.onrender.com/api/articles/${articleId}/like-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.hasLiked) {
          isLiked = true;
          heartBtn.classList.add("liked");
        }
      } catch (err) {
        console.error("❌ Error fetching like status:", err);
      }
    }
  })();

  // Handle like toggle
  heartBtn.addEventListener("click", async () => {
    if (!token) {
      alert("🚩 Please log in to like this article.");
      window.location.href = "loginPage.html";
      return;
    }

    isLiked = !isLiked;
    heartBtn.classList.toggle("liked");

    const endpoint = isLiked
      ? "https://afterthoughts.onrender.com/api/articles/add-like"
      : "https://afterthoughts.onrender.com/api/articles/remove-like";

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
      });
    } catch (err) {
      console.error("❌ Failed to sync like:", err);
    }
  });
});


const commentBtn = document.getElementById("comment-btn");
const commentInput = document.getElementById("comment");

async function analyzeSentiment(commentInput) {
  const modal = document.getElementById('sentimentModal');
  const message = document.getElementById('sentimentMessage');
  const emotion = document.getElementById('detectedEmotion');
  const confidence = document.getElementById('confidenceScore');
  const processedText = document.getElementById('processedText');
  
  try {
    const response = await fetch('https://afterthoughts.onrender.com/api/sentimentComments/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ text: commentInput.trim() })
    });

    if (!response.ok) throw new Error('Analysis failed');
    
    const data = await response.json();
    const sentimentMap = {
      'anger': 'negative',
      'disgust': 'negative',
      'fear': 'negative',
      'joy': 'positive',
      'neutral': 'neutral',
      'sadness': 'negative',
      'surprise': 'neutral'
    };

    const generalSentiment = sentimentMap[data.sentiment.toLowerCase()] || 'neutral';

    // Update modal content
    modal.className = `modal ${generalSentiment}`;
    message.innerHTML = generalSentiment === 'negative' 
      ? '🚫 Negative comments cannot be posted' 
      : `This comment appears ${generalSentiment}`;
      
    emotion.textContent = data.sentiment;
    confidence.textContent = `${(data.confidence * 100).toFixed(1)}%`;
    processedText.textContent = data.analyzedText;

    // Show modal
    modal.style.display = 'block';

    return new Promise((resolve) => {
      document.getElementById('confirmButton').onclick = () => {
        modal.style.display = 'none';
        resolve(generalSentiment !== 'negative');
      };
      
      document.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
        resolve(false);
      };
      
      window.onclick = (event) => {
        if (event.target === modal) {
          modal.style.display = 'none';
          resolve(false);
        }
      };
    });

  } catch (error) {
    alert(`❌ Analysis Error: ${error.message}`);
    return false;
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
        const allowed = await analyzeSentiment(text);
        if (!allowed) return;
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