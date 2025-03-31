console.log("🔥 Articles.js is running!");

// ==============================
// RENDER ARTICLE FUNCTION
// ==============================

function renderFullArticle({ title, author, text, image }) {
  const section = document.getElementById('article-section');
  if (!section) {
    console.error("❌ Missing <section id='article-section'> in HTML.");
    return;
  }

  section.innerHTML = "";

  const h1 = document.createElement('h1');
  h1.className = 'title';
  h1.textContent = title;

  const h2 = document.createElement('h2');
  h2.textContent = `by ${author || "Unknown Author"}`;

  const pre = document.createElement('pre');
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

  if (!allProfiles) {
    console.error("❌ Missing <div id='profile-contain'> in HTML.");
    return;
  }

  allProfiles.innerHTML = '';

  profiles.forEach(profile => {
    const profileElement = document.createElement('div');
    profileElement.classList.add('profile', 'other', 'feedback');

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
console.log("🆔 Article ID from URL:", articleId);

fetch(`https://afterthoughts.onrender.com/api/articles/${articleId}`)
  .then(response => {
    if (!response.ok) throw new Error("Article not found");
    return response.json();
  })
  .then(article => {
    renderFullArticle({
      title: article.title,
      author: article.author || "Unknown Author",
      text: article.text,
      image: article.image
    });
  })
  .catch(err => {
    console.error("Error loading article:", err);
    document.getElementById('article-section').innerHTML = "<p>Could not load article.</p>";
  });
  
  window.addEventListener("load", () => {
    makeProfile([]); // <- placeholder for when you add real profiles/comments
  });
