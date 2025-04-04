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
    }  // ------------------------------
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
        }  try {
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
    // SENTIMENT ANALYSIS
    // ==============================
    async function analyzeSentiment() {
      const inputText = document.getElementById('inputText').value.trim();
      
      if (!inputText) {
        throw new Error('Please enter some text to analyze');
      }
  
      const response = await fetch('https://afterthoughts.onrender.com/api/sentimentComments/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: inputText })
      });
  
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
  
      // Map specific emotions to a general sentiment
      const sentimentMap = {
          'anger': 'negative',
          'disgust': 'negative',
          'fear': 'negative',
          'joy': 'positive',
          'neutral': 'positive', // adjust as needed
          'sadness': 'negative',
          'surprise': 'positive'
      };
  
      const generalSentiment = sentimentMap[data.sentiment.toLowerCase()] || 'positive';
  
      // Return the sentiment results as an object
      return {
          sentiment: generalSentiment,
          feeling: data.sentiment,
          confidence: (data.confidence * 100).toFixed(1) // as a percentage string
      };
    }

    function showError(message) {
      const errorDiv = document.getElementById('error');
      errorDiv.innerHTML = message;
    }

    // ==============================
    // POST COMMENT
    // ==============================
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
              document.getElementById('inputText').value = "";
          } else {
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

    // ==============================
    // HANDLE COMMENT SUBMISSION WITH SENTIMENT CHECK
    // ==============================
    async function handleComment() {
      try {
          const commentText = document.getElementById('inputText').value.trim();
          if (!commentText) {
              showError('Please enter a comment.');
              return;
          }
  
          const result = await analyzeSentiment();
  
          // Check if comment sentiment is negative
          if (result.sentiment === 'negative') {
              const message = `Warning: Your comment appears negative (${result.feeling}) with ${result.confidence}% confidence.`;
              alert(message);
  
              // Ask user for confirmation to proceed
              if (!confirm("Do you want to proceed with posting this comment?")) {
                  return;
              }
          }
  
          // Proceed with posting comment if sentiment is positive or user confirmed for negative
          proceedWithComment(commentText);
      } catch (error) {
          console.error("Error in handling comment:", error);
          showError(`Error in sentiment analysis: ${error.message}`);
      }
    }
    
  
    
  })
  .catch(err => {
    console.error("❌ Error loading article:", err);
    document.getElementById('article-section').innerHTML = "<p>Could not load article.</p>";
  });
