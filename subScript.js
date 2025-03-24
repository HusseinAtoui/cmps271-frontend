document.addEventListener("DOMContentLoaded", () => {
    setupStaticEventListeners();
    loadDynamicContent();
  
    // Setup form submission
    const form = document.getElementById("submissionForm");
    const statusMessage = document.getElementById("statusMessage");
    const loadingIndicator = document.getElementById("loading");
    const token = localStorage.getItem("authToken");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      loadingIndicator.style.display = "block";
      statusMessage.innerHTML = "";
  
      // Create FormData from the form elements
      const formData = new FormData(form);
  
      // Append defaults for required fields if needed
      if (!formData.get("date")) {
        formData.append("date", new Date().toISOString());
      }
      if (!formData.get("minToRead")) {
        formData.append("minToRead", "1");
      }
      if (!formData.get("tag")) {
        formData.append("tag", "general");
      }
  
      // Check if a document file is selected and it's a PDF
      const docInput = document.getElementById("document");
      if (docInput.files.length > 0) {
        const docFile = docInput.files[0];
        if (docFile.type === "application/pdf") {
          try {
            const pdfText = await convertPdfToText(docFile);
            // Append the extracted text to the FormData with key "text"
            formData.append("text", pdfText);
          } catch (error) {
            console.error("Error converting PDF to text:", error);
            statusMessage.innerHTML = `<p style="color: red;">Error converting PDF to text.</p>`;
            loadingIndicator.style.display = "none";
            return;
          }
        } else {
          // If not a PDF, set text as empty
          formData.append("text", "");
        }
      } else {
        // No document provided; ensure "text" field is appended
        formData.append("text", "");
      }
  
      // Submit the form data to the backend
      try {
        const response = await fetch("https://afterthoughts.onrender.com/api/articles/add", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
            // Do NOT manually set Content-Type for FormData.
          },
          body: formData
        });
  
        const result = await response.json();
        if (response.ok) {
          statusMessage.innerHTML = `<p style="color: green;">Submission successful!</p>`;
          form.reset();
        } else {
          statusMessage.innerHTML = `<p style="color: red;">Error: ${result.error || result.message}</p>`;
        }
      } catch (error) {
        console.error("Network error:", error);
        statusMessage.innerHTML = `<p style="color: red;">Network error! Check console.</p>`;
      } finally {
        loadingIndicator.style.display = "none";
      }
    });
  
    // Convert PDF file to text using pdf.js while preserving spacing and line breaks
    async function convertPdfToText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function() {
          try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let extractedText = "";
  
            // Loop through all pages
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const content = await page.getTextContent();
              // Join text items with spaces and add a newline after each page
              const pageText = content.items.map(item => item.str).join(" ");
              extractedText += pageText + "\n";
            }
            resolve(extractedText);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = function(err) {
          reject(err);
        };
        reader.readAsArrayBuffer(file);
      });
    }
  
    // Update file name display for document input
    document.getElementById("document").addEventListener("change", function() {
      document.getElementById("documentName").textContent = this.files[0] ? this.files[0].name : "No Document chosen";
    });
  
    // Update file name display for picture input
    document.getElementById("picture").addEventListener("change", function() {
      document.getElementById("pictureName").textContent = this.files[0] ? this.files[0].name : "No file chosen";
    });
  });
  
  // Existing functions for setting up static listeners and loading dynamic content:
  function setupStaticEventListeners() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        console.log("Login button clicked");
      });
    }
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        console.log("Submit button clicked");
      });
    }
    const joinBtn = document.querySelector('.join-btn');
    if (joinBtn) {
      joinBtn.addEventListener('click', () => {
        console.log("Join membership button clicked");
      });
    }
    document.getElementById("categoryFilter").addEventListener("change", filterArticlesByTag);
    document.getElementById("searchInput").addEventListener("input", searchArticles);
  }
  
  async function loadDynamicContent() {
    await loadArticles();
  }
  
  async function loadArticles() {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = "";
  
    let articlesData;
    try {
      const response = await fetch('https://afterthoughts.onrender.com/api/articles/');
      if (response.ok) {
        articlesData = await response.json();
      } else {
        throw new Error("Response not ok");
      }
    } catch (error) {
      console.error("Error loading articles from backend:", error);
      articlesData = [];
    }
    displayArticles(articlesData);
  }
  
  function displayArticles(articles) {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = "";
  
    if (articles.length === 0) {
      gridContainer.innerHTML = "<p>No articles found.</p>";
      return;
    }
  
    articles.forEach(article => {
      const card = document.createElement('div');
      card.classList.add('card');
  
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('imagecontainer');
      if (article.image) {
        const img = document.createElement('img');
        img.src = article.image;
        img.alt = article.title;
        imageContainer.appendChild(img);
      }
  
      const textSection = document.createElement('div');
      textSection.classList.add('text-section');
  
      const titleP = document.createElement('p');
      titleP.classList.add('title');
      titleP.textContent = article.title;
  
      const formattedDate = new Date(article.date);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDateString = formattedDate.toLocaleDateString('en-US', options);
  
      const detailsP = document.createElement('p');
      detailsP.classList.add('details');
      detailsP.textContent = `${formattedDateString} | ${article.minToRead} min read`;
  
      const descriptionP = document.createElement('p');
      descriptionP.classList.add('description');
      descriptionP.textContent = article.description;
  
      const continueBtn = document.createElement('button');
      continueBtn.classList.add('continue-reading');
      continueBtn.textContent = "Continue reading";
      continueBtn.addEventListener('click', () => {
        window.location.href = `/articles/${article._id}`;
      });
  
      const buttonsDiv = document.createElement('div');
      buttonsDiv.classList.add('buttons');
  
      const authorName = document.createElement('p');
      authorName.classList.add('authorname');
      authorName.textContent = article.author;
  
      textSection.append(titleP, detailsP, descriptionP, buttonsDiv);
      buttonsDiv.append(continueBtn, authorName);
      card.append(imageContainer, textSection);
      gridContainer.appendChild(card);
    });
  }
  
  async function filterArticlesByTag() {
    const selectedTag = document.getElementById("categoryFilter").value;
    if (selectedTag === "all") {
      return loadArticles();
    }
    try {
      const apiUrl = `https://afterthoughts.onrender.com/api/articles/tag/${encodeURIComponent(selectedTag)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch articles. Status: ${response.status}`);
      }
      const filteredArticles = await response.json();
      if (filteredArticles.length === 0) {
        document.querySelector('.grid-container').innerHTML = "<p>No articles found for this tag.</p>";
      } else {
        displayArticles(filteredArticles);
      }
    } catch (error) {
      console.error("Error fetching articles by tag:", error);
      document.querySelector('.grid-container').innerHTML = `<p>Error loading articles: ${error.message}</p>`;
    }
  }
  
  async function searchArticles() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    if (!query) {
      return loadArticles();
    }
    try {
      const response = await fetch('https://afterthoughts.onrender.com/api/articles/');
      if (response.ok) {
        let articles = await response.json();
        articles = articles.filter(article =>
          article.title.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.text.toLowerCase().includes(query)
        );
        displayArticles(articles);
      } else {
        throw new Error("Response not ok");
      }
    } catch (error) {
      console.error("Error searching articles:", error);
    }
  }
  