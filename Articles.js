console.log("🔥 Articles.js is running!");

// Global variable to store whether the comment passes sentiment guidelines.
// null means analysis not yet run, true means acceptable, false means negative.
let sentimentAllowed = null;

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
// SENTIMENT ANALYSIS FUNCTION
// ==============================
async function runSentimentAnalysis(text) {
  try {
    const response = await fetch('http://localhost:3000/api/sentimentComments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw error;
  }
}

// ==============================
// ANALYZE SENTIMENT (Triggered by button)
// ==============================
async function analyzeSentiment() {
  // We use the textarea with id "comment" as our input.
  const inputText = document.getElementById('comment').value.trim();
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  // Clear previous results
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';
  resultDiv.className = 'result';

  if (!inputText) {
    showError('Please enter some text to analyze');
    sentimentAllowed = false;
    return;
  }

  try {
    const data = await runSentimentAnalysis(inputText);

    // Map raw emotion to a general sentiment category.
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

    resultDiv.className = `result ${generalSentiment}`;
    resultDiv.innerHTML = `
      <strong>Sentiment:</strong> ${generalSentiment}<br>
      <strong>Original Emotion:</strong> ${data.sentiment}<br>
      <strong>Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%<br>
      <div class="details">
        Analyzed text: "${data.analyzedText}"<br>
        Original length: ${data.originalLength} characters
      </div>
    `;

    if (generalSentiment === 'negative') {
      alert(`Your comment appears negative (${data.sentiment} with ${(data.confidence * 100).toFixed(1)}% confidence). Please revise it to abide by our guidelines.`);
      sentimentAllowed = false;
    } else {
      sentimentAllowed = true;
    }
  } catch (error) {
    showError(`Analysis failed: ${error.message}`);
    console.error('Error:', error);
    sentimentAllowed = false;
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.innerHTML = message;
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

    // ==============================
    // KUDOS FUNCTIONALITY
    // ==============================
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

    // ==============================
    // COMMENT POSTING WITH SENTIMENT CHECK
    // ==============================
    // The sentiment analysis MUST be run before posting. The "Analyze Sentiment" button should be clicked
    // which sets the global variable "sentimentAllowed" accordingly.
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

        // Ensure sentiment analysis has been performed.
        if (sentimentAllowed === null) {
          alert("Please analyze the sentiment of your comment before posting.");
          return;
        }

        if (sentimentAllowed === false) {
          alert("Your comment does not abide by our guidelines. Please revise it.");
          return;
        }

        // If sentimentAllowed is true, proceed to post the comment
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

            // Retrieve user data from localStorage
            const userData = JSON.parse(localStorage.getItem("userData")) || {};
            const newComment = {
              name: `${userData.firstName || "Anonymous"} ${userData.lastName || ""}`,
              image: userData.profileImage || "default.png",
              comment: text
            };

            // Update global comments array and UI immediately
            const existing = document._existingComments || [];
            const updated = [newComment, ...existing];
            document._existingComments = updated;
            makeProfile(updated);

            // Clear the input field
            commentInput.value = "";
            // Reset sentimentAllowed for the next comment
            sentimentAllowed = null;
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
