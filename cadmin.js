document.addEventListener("DOMContentLoaded", async () => {
    // Existing AI Toggle Div
    let aiToggleDiv = document.getElementById("ai-toggle-div");
    if (!aiToggleDiv) {
        aiToggleDiv = document.createElement("div");
        aiToggleDiv.id = "ai-toggle-div";
        aiToggleDiv.className = "hidden";
        aiToggleDiv.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>AI Plagiarism Check</h2>
                <p id="ai-result-text">Processing...</p>
            </div>
        `;
        document.body.appendChild(aiToggleDiv);
    }
  
    // New Sentiment Analysis Toggle Div
    const sentimentToggleDiv = document.createElement("div");
    sentimentToggleDiv.id = "sentiment-toggle-div";
    sentimentToggleDiv.className = "hidden";
    sentimentToggleDiv.innerHTML = `
        <div class="modal-content">
            <span class="close-sentiment-btn">&times;</span>
            <h2>Sentiment Analysis</h2>
            <p id="sentiment-result-text">Analyzing sentiment...</p>
        </div>
    `;
    document.body.appendChild(sentimentToggleDiv);
  
    // Query elements
    const aiResultText = document.getElementById("ai-result-text");
    const sentimentResultText = document.getElementById("sentiment-result-text");
    const closeBtns = {
        ai: aiToggleDiv.querySelector(".close-btn"),
        sentiment: sentimentToggleDiv.querySelector(".close-sentiment-btn")
    };
  
    // Toggle functions
    function toggleDiv(div) {
        div.classList.toggle("hidden");
    }
  
    // Sentiment Analysis Handler
    async function handleSentimentAnalysis(articleText) {
        try {
            const response = await fetch("http://localhost:3000/api/sentimentComments/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: articleText })
            });
  
            if (!response.ok) throw new Error("Analysis failed");
            const data = await response.json();
  
            sentimentResultText.innerHTML = `
                <strong>Dominant Emotion:</strong> ${data.emotion}<br>
                <strong>Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%<br>
                <strong>Sample Text:</strong> "${data.analyzedText}..."
            `;
        } catch (error) {
            sentimentResultText.textContent = "Error analyzing sentiment";
            console.error("Sentiment Error:", error);
        }
    }
  
    // Modified Article Template
    function createArticleHTML(article) {
        return `
            <div class="article">
                <h2>${article.title}</h2>
                <img src="${article.image}" alt="Article Image" class="article-image">
                <p><strong>Author:</strong> ${article.author}</p>
                <p><strong>Description:</strong> ${article.description}</p>
                <p><strong>Tag:</strong> ${article.tag} | <strong>Read Time:</strong> ${article.minToRead} min</p>
                <p><strong>Date:</strong> ${new Date(article.date).toLocaleDateString()}</p>
                <p><strong>Full Text:</strong> ${article.text}</p>
                <div class="article-actions">
                    <button class="approve" data-id="${article._id}">Approve</button>
                    <button class="disapprove" data-id="${article._id}">Disapprove</button>
                    <button class="delete" data-id="${article._id}">Delete</button>
                    <button class="check-ai" data-text="${article.text}">AI Check</button>
                    <button class="check-sentiment" data-text="${article.text}">Sentiment</button>
                </div>
            </div>
        `;
    }
  
    // Modified Button Event Listeners
    document.querySelectorAll(".check-sentiment").forEach((button) => {
        button.addEventListener("click", async () => {
            if (!sentimentToggleDiv.classList.contains("hidden")) {
                toggleDiv(sentimentToggleDiv);
                return;
            }
  
            sentimentResultText.textContent = "Analyzing sentiment...";
            toggleDiv(sentimentToggleDiv);
            
            const articleText = button.getAttribute("data-text");
            await handleSentimentAnalysis(articleText);
        });
    });
  
    // Close Button Handlers
    closeBtns.ai.addEventListener("click", () => toggleDiv(aiToggleDiv));
    closeBtns.sentiment.addEventListener("click", () => toggleDiv(sentimentToggleDiv));
  
    // Rest of your existing code remains the same...
    // [Keep all existing fetchArticles implementation]
    // [Keep existing form submission handler]
  });