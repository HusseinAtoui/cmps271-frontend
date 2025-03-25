document.addEventListener("DOMContentLoaded", async function(){
    try {
      const response = await fetch("http://localhost:3000/api/articles");
      const articles = await response.json();
      const container = document.querySelector('.articles-container');
      container.innerHTML = "";
      
      articles.forEach(article => {
        const card = document.createElement("div");
        card.classList.add("article-card");
        card.innerHTML = `
          <h2>${article.title}</h2>
          <p>${article.description}</p>
          <button class="continue-btn" data-id="${article._id}">Continue Reading</button>
        `;
        container.appendChild(card);
      });
      
      document.querySelectorAll(".continue-btn").forEach(btn => {
        btn.addEventListener("click", function(){
          const articleId = this.getAttribute("data-id");
          window.location.href = "article.html?id=" + articleId;
        });
      });
      
    } catch(error) {
      console.error("Error loading articles:", error);
    }
  });
  