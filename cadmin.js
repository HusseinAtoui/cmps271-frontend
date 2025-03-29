document.addEventListener("DOMContentLoaded", async () => {

    let aiToggleDiv = document.getElementById("ai-toggle-div");
  if (!aiToggleDiv) {
    aiToggleDiv = document.createElement("div");
    aiToggleDiv.id = "ai-toggle-div";
    aiToggleDiv.className = "hidden"; // hidden by default
    aiToggleDiv.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>AI Plagiarism Check</h2>
        <p id="ai-result-text">Processing...</p>
      </div>
    `;
    document.body.appendChild(aiToggleDiv);
  }

  const aiResultText = document.getElementById("ai-result-text");
  const closeBtn = aiToggleDiv.querySelector(".close-btn");

  // Toggle function to show/hide the div
  function toggleAIToggleDiv() {
    if (aiToggleDiv.classList.contains("hidden")) {
      aiToggleDiv.classList.remove("hidden");
    } else {
      aiToggleDiv.classList.add("hidden");
    }
  }
    async function fetchArticles() {
        try {
            const response = await fetch('https://afterthoughts.onrender.com/api/articles/');
            if (!response.ok) throw new Error('Failed to fetch articles');
            const articles = await response.json();
            const articlesList = document.getElementById('articles-list');
            articlesList.innerHTML = articles.map(article => `
                <div class="article">
                    <h2>${article.title}</h2>
                    <img src="${article.image}" alt="Article Image" class="article-image">
                    <p><strong>Author:</strong> ${article.author}</p>
                    <p><strong>Description:</strong> ${article.description}</p>
                    <p><strong>Tag:</strong> ${article.tag} | <strong>Read Time:</strong> ${article.minToRead} min</p>
                    <p><strong>Date:</strong> ${new Date(article.date).toLocaleDateString()}</p>
                    <p><strong>Full Text:</strong> ${article.text}</p>
                    <button class="approve" data-id="${article._id}">Approve</button>
                    <button class="disapprove" data-id="${article._id}">Disapprove</button>
                    <button class="delete" data-id="${article._id}">Delete</button>
                    <button class="check-ai" data-text="${article.text}">Check for AI Plagiarism</button>
                </div>
            `).join('');

            document.querySelectorAll('.approve').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.getAttribute('data-id');
                    console.log("Approve button clicked:", id);
                    
                    const response = await fetch(`http://localhost:3000/api/articles/approve/${id}`, {
                        method: 'PUT'
                    });
            
                    if (response.ok) {
                        alert("Article approved successfully!");
                        fetchArticles(); // Reload the article list
                    } else {
                        alert("Failed to approve the article.");
                    }
                });
            });
            

            // Disapprove buttons
            document.querySelectorAll('.disapprove').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.getAttribute('data-id');
                    console.log("Disapprove button clicked:", id);
                    await fetch(`http://localhost:3000/api/articles/disapprove/${id}`, { method: 'PUT' });
                    


                    alert("Article disapproved successfully!");
                    fetchArticles();
                });
            });

            document.querySelectorAll('.delete').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.getAttribute('data-id');
                    console.log("Delete button clicked:", id);
                    
                    const response = await fetch(`http://localhost:3000/api/articles/delete/${id}`, {
                        method: 'DELETE'
                    });
            
                    if (response.ok) {
                        alert("Article deleted successfully!");
                        fetchArticles(); // Reload list after deletion
                    } else {
                        alert("Failed to delete the article.");
                    }
                });
            });
            
            document.querySelectorAll(".check-ai").forEach(button => {
                button.addEventListener("click", async () => {
                  // If the div is already visible, hide it
                  if (!aiToggleDiv.classList.contains("hidden")) {
                    toggleAIToggleDiv();
                    return;
                  }
            
                  // Otherwise, show the div and make the API call
                  aiResultText.textContent = "Checking plagiarism, please wait...";
                  toggleAIToggleDiv(); // Show the div
            
                  const articleText = button.getAttribute("data-text");
            
                  try {
                    const aiResponse = await fetch("http://localhost:3000/api/aiplagarism/detect", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                      },
                      body: JSON.stringify({ text: articleText })
                    });
            
                    if (!aiResponse.ok) throw new Error("AI check failed");
            
                    const result = await aiResponse.json();
                    aiResultText.innerHTML = `
                    <br></br>
                    <strong style="color:rgb(242, 232, 230); font-size: 24px;">  ${(result.score * 100).toFixed(2)}%
                    <strong>
                    `;
                  } catch (error) {
                    aiResultText.textContent = "Failed to check AI plagiarism.";
                    console.error("AI Check Error:", error);
                  }
                });
              });
            
              // Attach toggle to close button as well
              closeBtn.addEventListener("click", () => {
                toggleAIToggleDiv();
              });

        } catch (error) {
            console.error("Error fetching articles:", error);
            alert("Failed to load articles");
        }
    }

    // Initial article fetch
    fetchArticles();

    // Handle form submission
    document.getElementById('article-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('author', document.getElementById('author').value);
        formData.append('minToRead', document.getElementById('minToRead').value);
        formData.append('tag', document.getElementById('tag').value);
        formData.append('date', document.getElementById('date').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('text', document.getElementById('text')?.value || ''); // in case 'text' input isn't present
        if (document.getElementById('image').files[0]) {
            formData.append('image', document.getElementById('image').files[0]);
        }

        try {
            const response = await fetch('https://afterthoughts.onrender.com/api/articles/add', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to add article');
            fetchArticles();
        } catch (error) {
            console.error("Error adding article:", error);
        }
    });
});
