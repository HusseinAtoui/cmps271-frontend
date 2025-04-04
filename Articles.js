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


// ========================
// SENTIMENT ANALYSIS SYSTEM
// ========================
const sentimentMap = {
  'anger': 'negative',
  'disgust': 'negative',
  'fear': 'negative',
  'sadness': 'negative',
  'joy': 'positive',
  'surprise': 'neutral',
  'neutral': 'neutral'
};

async function analyzeSentiment(text) {
  try {
      const response = await fetch('http://localhost:3000/api/sentimentComments/', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Analysis failed');
      return await response.json();
  } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      throw error;
  }
}

function showSentimentResult(data) {
  const resultDiv = document.getElementById('sentiment-result');
  const errorDiv = document.getElementById('sentiment-error');
  errorDiv.style.display = 'none';

  const generalSentiment = sentimentMap[data.emotion.toLowerCase()] || 'neutral';
  
  resultDiv.className = `sentiment-result ${generalSentiment}`;
  resultDiv.innerHTML = `
      <strong>Sentiment:</strong> ${generalSentiment}<br>
      <strong>Detected Emotion:</strong> ${data.emotion}<br>
      <strong>Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%
  `;
  resultDiv.style.display = 'block';
}

function showGuidelinesWarning(message) {
  const warningDiv = document.getElementById('guidelines-warning');
  warningDiv.textContent = message;
  warningDiv.classList.add('visible');
}

// ========================
// COMMENT SYSTEM
// ========================
document.getElementById('analyze-btn').addEventListener('click', async () => {
  const commentText = document.getElementById('comment').value.trim();
  const errorDiv = document.getElementById('sentiment-error');
  
  if (!commentText) {
      errorDiv.textContent = 'Please enter text to analyze';
      errorDiv.style.display = 'block';
      return;
  }

  try {
      const analysis = await analyzeSentiment(commentText);
      showSentimentResult(analysis);
  } catch (error) {
      errorDiv.textContent = 'Failed to analyze sentiment. Please try again.';
      errorDiv.style.display = 'block';
  }
});

document.getElementById('comment-btn').addEventListener('click', async () => {
  const commentText = document.getElementById('comment').value.trim();
  const errorDiv = document.getElementById('sentiment-error');
  errorDiv.style.display = 'none';

  if (!commentText) {
      errorDiv.textContent = 'Please write a comment before submitting.';
      errorDiv.style.display = 'block';
      return;
  }

  try {
      // Check sentiment before posting
      const analysis = await analyzeSentiment(commentText);
      const sentiment = sentimentMap[analysis.emotion.toLowerCase()] || 'neutral';

      if (sentiment === 'negative') {
          showGuidelinesWarning('⚠️ This comment violates our community guidelines. Please maintain a respectful and constructive tone.');
          return;
      }

      // Proceed with comment submission
      const token = localStorage.getItem("authToken");
      if (!token) {
          alert("🚩 You need to be logged in to comment.");
          window.location.href = "loginPage.html";
          return;
      }

      const response = await fetch("https://afterthoughts.onrender.com/api/articles/comment-article", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
              articleId: new URLSearchParams(window.location.search).get('id'),
              text: commentText 
          })
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      // Update UI
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      const newComment = {
          name: `${userData.firstName || "Anonymous"} ${userData.lastName || ""}`,
          image: userData.profileImage || "default.png",
          comment: commentText
      };

      const existing = document._existingComments || [];
      document._existingComments = [newComment, ...existing];
      makeProfile(document._existingComments);
      
      document.getElementById('comment').value = '';
      document.getElementById('sentiment-result').style.display = 'none';

  } catch (error) {
      console.error("Comment Error:", error);
      errorDiv.textContent = 'Failed to post comment. Please try again.';
      errorDiv.style.display = 'block';
  }
});

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
        const token = localStorage.getItem("authToken");
        const text = commentInput.value.trim();
        const userData = JSON.parse(localStorage.getItem("userData"));

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

            const existing = document._existingComments || [];
            const updated = [newComment, ...existing];
            document._existingComments = updated;
            makeProfile(updated);
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
