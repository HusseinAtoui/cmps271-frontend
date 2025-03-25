document.addEventListener("DOMContentLoaded", async () => {
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
                </div>
            `).join('');

            // Attach Approve button listeners
            document.querySelectorAll('.approve').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.getAttribute('data-id');
                    console.log("Approve button clicked:", id);
                    await fetch(`https://afterthoughts.onrender.com/api/articles/approve/${id}`, { method: 'PUT' });
                    fetchArticles();
                });
            });

            // Attach Disapprove button listeners
            document.querySelectorAll('.disapprove').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.getAttribute('data-id');
                    console.log("Disapprove button clicked:", id);
                    await fetch(`https://afterthoughts.onrender.com/api/articles/disapprove/${id}`, { method: 'PUT' });
                    alert("Article disapproved successfully!");
                    fetchArticles();
                });
            });

            // Attach Delete button listeners
            document.querySelectorAll('.delete').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.getAttribute('data-id');
                    await fetch(`https://afterthoughts.onrender.com/api/articles/delete/${id}`, { method: 'DELETE' });
                    fetchArticles();
                });
            });
        } catch (error) {
            console.error("Error fetching articles:", error);
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
        formData.append('text', document.getElementById('text').value);
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
