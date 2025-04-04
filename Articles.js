
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
      author: article.userID,
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
    // Kudos Functionality
    // ------------------------------
    const kudosBtn = document.getElementById("kudos-btn");
    if (kudosBtn) {
      kudosBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("authToken");

        console.log("🛠️ Sending Kudos request for Article ID:", articleId);

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

// ==============================
// SENTIMENT ANALYSIS & CONFIRMATION
// ==============================
async function analyzeSentimentAndConfirm() {
  const inputText = document.getElementById('inputText').value.trim();
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  // Clear previous results
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';

  if (!inputText) {
    showError('Please enter some text to analyze');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/sentimentComments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: inputText })
    });

    // Sentiment mapping
    const sentimentMap = {
      'anger': 'negative',
      'disgust': 'negative',
      'fear': 'negative',
      'joy': 'positive',
      'neutral': 'neutral',
      'sadness': 'negative',
      'surprise': 'neutral'
    };

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const generalSentiment = sentimentMap[data.sentiment.toLowerCase()] || 'neutral';

    // If negative, show confirmation div; otherwise, proceed immediately.
    if (generalSentiment === 'negative') {
      resultDiv.className = `result ${generalSentiment}`;
      resultDiv.innerHTML = `
          <strong>⚠️ Warning: Negative Comment Detected</strong><br>
          Sentiment: ${generalSentiment}<br>
          <strong>Original Emotion:</strong> ${data.sentiment}<br>
          <strong>Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%<br>
          <div class="details">
              Analyzed text: "${data.analyzedText}"<br>
              Original length: ${data.originalLength} characters
          </div>
      `;

      // Show confirmation div
      document.getElementById('confirm-comment').style.display = 'block';

      // Set up event listeners for the confirmation buttons:
      document.getElementById('edit-comment').onclick = () => {
        // Hide the confirmation div and let the user edit the comment
        document.getElementById('confirm-comment').style.display = 'none';
      };

      document.getElementById('proceed-comment').onclick = () => {
        // Hide the confirmation div and proceed with posting the comment
        document.getElementById('confirm-comment').style.display = 'none';
        proceedWithComment(inputText);
      };

    } else {
      // For positive or neutral sentiment, post the comment directly.
      proceedWithComment(inputText);
    }
  } catch (error) {
    showError(`Analysis failed: ${error.message}`);
    console.error('Error:', error);
  }
}

// ==============================
// BIND THE COMMENT BUTTON TO SENTIMENT ANALYSIS
// ==============================
// Assuming you have a comment button with id 'comment-btn'
const commentBtn = document.getElementById("comment-btn");
if (commentBtn) {
  commentBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default form submission if applicable
    analyzeSentimentAndConfirm();
  });
}


  async function proceedWithComment(text) {
      try {
          const response = await fetch("https://afterthoughts.onrender.com/api/articles/comment-article", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`
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
          console.error("❌ Error in proceedWithComment:", err);
      }
  }  

})

.catch(err => {
  console.error("❌ Error loading article:", err);
  document.getElementById('article-section').innerHTML = "<p>Could not load article.</p>";
});