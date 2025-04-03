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


console.log("🔥 Articles.js is running!");

// ==============================
// HELPER FUNCTIONS
// ==============================

// Simple profanity filter
const bannedWords = ["fuck", "shit", "damn", "bitch", "asshole", "bastard", "cunt"]; // Add more words as needed

// Sentiment Mapping
const sentimentMap = {
  'anger': 'negative',
  'disgust': 'negative',
  'fear': 'negative',
  'joy': 'positive',
  'neutral': 'neutral',
  'sadness': 'negative',
  'surprise': 'neutral'
};

// ==============================
// ANALYZE SENTIMENT BEFORE COMMENTING
// ==============================

async function analyzeSentiment() {
  const inputText = document.getElementById('comment').value.trim();
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  // Clear previous messages
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';

  if (!inputText) {
    showError('⚠️ Please enter a comment before analyzing.');
    return false;
  }

  // Check for profanity
  const containsBannedWord = bannedWords.some(word => inputText.toLowerCase().includes(word));
  if (containsBannedWord) {
    showError('❌ Your comment contains inappropriate language and cannot be posted.');
    return false;
  }

  try {
    const response = await fetch('http://localhost:3000/api/sentimentComments/', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const generalSentiment = sentimentMap[data.sentiment.toLowerCase()] || 'neutral';

    // Display sentiment result
    resultDiv.innerHTML = `<strong>Sentiment:</strong> ${generalSentiment}`;

    // Block negative comments
    if (generalSentiment === 'negative') {
      showError('❌ Your comment is too negative and does not meet our guidelines.');
      return false;
    }

    return true;
  } catch (error) {
    showError(`❌ Analysis failed: ${error.message}`);
    console.error('Error:', error);
    return false;
  }
}

// Show error messages
function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.innerHTML = message;
}

// ==============================
// HANDLE COMMENT SUBMISSION
// ==============================

async function submitComment() {
  console.log("Comment button clicked");

  const token = localStorage.getItem("authToken");
  const text = document.getElementById("comment").value.trim();

  if (!token) {
    alert("🚩 You need to be logged in to comment.");
    window.location.href = "loginPage.html";
    return;
  }

  if (!text) {
    alert("✍️ Please write a comment before submitting.");
    return;
  }

  // Analyze sentiment before allowing submission
  const isValid = await analyzeSentiment();
  if (!isValid) return;

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
      document.getElementById("comment").value = "";
    } else {
      alert(`⚠️ ${data.message}`);
    }
  } catch (err) {
    console.error("❌ Error posting comment:", err);
  }
}

// ==============================
// EVENT LISTENER FOR COMMENT BUTTON
// ==============================

document.getElementById("comment-btn").addEventListener("click", submitComment);

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
      author: article.userID,
      text: article.text,
      image: article.image
    });

    if (Array.isArray(article.comments)) {
      const formattedComments = article.comments.map(comment => ({
        name: comment.postedBy.firstName + " " + comment.postedBy.lastName,
        image: comment.postedBy.profilePicture,  // Using the profile picture from the User model
        comment: comment.text
      }));

      document._existingComments = formattedComments;
      makeProfile(formattedComments);
    }

    const kudosBtn = document.getElementById("kudos-btn");
    if (kudosBtn) {
      kudosBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
          alert("🚩 Please log in to give kudos.");
          window.location.href = "loginPage.html";
          return;
        }

        try {
          const response = await fetch("https://afterthoughts.onrender.com/api/articles/give-kudos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ articleId })
          });

          const data = await response.json();
          
          if (response.ok) {
            alert("✅ Kudos added!");
            kudosBtn.disabled = true;
          } else {
            alert(`⚠️ ${data.message}`);
          }
        } catch (err) {
          console.error("❌ Error sending kudos:", err);
        }
      });
    }
    const commentBtn = document.getElementById("comment-btn");
    const commentInput = document.getElementById("comment");
    
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
    
        try {
          // Send the comment to the backend
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
            
            // Create the new comment object using the user’s info
            const newComment = {
              name: `${userData.firstName || "Anonymous"} ${userData.lastName || ""}`,
              image: userData.profileImage || "default.png",  // Fallback image
              comment: text
            };
    
            // Get the existing comments and add the new one at the top
            const existing = document._existingComments || [];
            const updated = [newComment, ...existing];
    
            // Update global variable
            document._existingComments = updated;
    
            // Update UI immediately
            makeProfile(updated);
    
            // Clear the input field
            commentInput.value = "";
          } else {
            alert(`⚠️ ${data.message}`);
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
