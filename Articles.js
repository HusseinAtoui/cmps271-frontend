
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
// ==============================
// HEART BUTTON FUNCTIONALITY
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const heartBtn = document.getElementById('kudos-btn');
  const articleId = new URLSearchParams(window.location.search).get('id');
  const token = localStorage.getItem("authToken");

  if (heartBtn && articleId) {
    let isLiked = false;

    // Check initial like status if user is logged in
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

    // Handle click event
    heartBtn.addEventListener("click", async () => {
      // Check if user is logged in
      if (!token) {
        alert("Please log in to like this article.");
        window.location.href = "loginPage.html";
        return;
      }

      // Optimistic UI update
      isLiked = !isLiked;
      heartBtn.classList.toggle("liked");
      heartBtn.disabled = true; // Prevent multiple clicks

      try {
        const endpoint = isLiked
          ? "https://afterthoughts.onrender.com/api/articles/add-like"
          : "https://afterthoughts.onrender.com/api/articles/remove-like";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ articleId })
        });

        if (!response.ok) {
          throw new Error("Failed to update like status");
        }
      } catch (err) {
        console.error("Error updating like:", err);
        // Revert UI if API call fails
        isLiked = !isLiked;
        heartBtn.classList.toggle("liked");
      } finally {
        heartBtn.disabled = false;
      }
    });

    // Initialize like status
    checkLikeStatus();
  }
});


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
  
        // Block negative comments with modal
        if (generalSentiment === 'negative') {
          showNegativeCommentModal();
          return;
        }
      
        // Handle analysis errors
        if (generalSentiment === 'error') {
          const confirmPost = confirm("⚠️ Sentiment analysis failed. Post comment anyway?");
          if (!confirmPost) return;
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
function showNegativeCommentModal() {
  const modal = document.getElementById('negative-comment-modal');
  modal.style.display = 'flex';
}

function hideNegativeCommentModal() {
  const modal = document.getElementById('negative-comment-modal');
  modal.style.display = 'none';
}

// Add event listener for modal close
document.getElementById('modal-close-btn').addEventListener('click', hideNegativeCommentModal);

// Modified sentiment check in your comment submission code
if (generalSentiment === 'negative') {
  showNegativeCommentModal();
  return;
}