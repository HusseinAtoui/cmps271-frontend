document.addEventListener("DOMContentLoaded", async function(){
    // Get article ID from URL query string
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");
    if (!articleId) {
      console.error("No article ID provided.");
      return;
    }
    
    // Fetch the full article by ID
    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error("Article not found.");
      }
      const article = await response.json();
      
      document.getElementById("articleTitle").textContent = article.title;
      document.getElementById("articleContent").textContent = article.text;
      
      // Render existing comments
      const commentsContainer = document.getElementById("commentsContainer");
      commentsContainer.innerHTML = "";
      if (article.comments && article.comments.length > 0) {
        article.comments.forEach(comment => {
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment");
          const commentDate = comment.created ? new Date(comment.created).toLocaleString() : "";
          commentDiv.innerHTML = `
            <p>${comment.text}</p>
            <small>Posted by: ${comment.postedBy} on ${commentDate}</small>
          `;
          commentsContainer.appendChild(commentDiv);
        });
      } else {
        commentsContainer.innerHTML = "<p>No comments yet.</p>";
      }
      
    } catch (error) {
      console.error("Error fetching article:", error);
    }
    
    // Handle comment submission with sentiment analysis
    const commentForm = document.getElementById("commentForm");
    const commentResponse = document.getElementById("commentResponse");
    
    commentForm.addEventListener("submit", async function(e){
      e.preventDefault();
      const commentText = document.getElementById("commentText").value.trim();
      
      if (!commentText) {
        alert("Comment cannot be empty.");
        return;
      }
      
      try {
        const res = await fetch("http://localhost:3000/api/articles/comment-article", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // If authentication is required, include your token:
            // "Authorization": "Bearer " + localStorage.getItem("authToken")
          },
          // In this example, postedBy is sent from the front end; in production, use your authenticated user info.
          body: JSON.stringify({ articleId, text: commentText, postedBy: "USER_ID" })
        });
        
        const result = await res.json();
        if (res.ok) {
          commentResponse.textContent = result.message;
          // Reload or update the comments
          window.location.reload();
        } else {
          commentResponse.textContent = result.message || "Failed to add comment.";
        }
      } catch (err) {
        console.error("Error posting comment:", err);
        commentResponse.textContent = "Error posting comment.";
      }
    });
  });
  