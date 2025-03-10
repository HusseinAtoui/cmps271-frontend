document.addEventListener("DOMContentLoaded", () => {
    fetchArticles();
});

async function fetchArticles() {
    try {
        const response = await fetch("/api/articles"); // Adjust API endpoint as needed
        if (!response.ok) throw new Error("Failed to fetch articles");
        
        const articles = await response.json();
        populateTable(articles);
    } catch (error) {
        console.error("Error loading articles:", error);
    }
}

function populateTable(articles) {
    const tableBody = document.getElementById("submissions-table");
    tableBody.innerHTML = "";

    articles.forEach(article => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${article.name}</td>
            <td>${article.email}</td>
            <td>${article.phone}</td>
            <td>${article.bio}</td>
            <td><a href="${article.document}" target="_blank">View</a></td>
            <td><img src="${article.picture}" alt="Picture" width="50"></td>
            <td>${new Date(article.submittedAt).toLocaleString()}</td>
            <td id="status-${article.id}">${article.status}</td>
            <td>
                <button onclick="updateStatus('${article.id}', 'Approved')" style="background-color: #4CAF50; color: white;">Approve</button>
                <button onclick="updateStatus('${article.id}', 'Rejected')" style="background-color: #f44336; color: white;">Reject</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function updateStatus(id, status) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this article?`)) return;

    try {
        const response = await fetch(`/api/articles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error("Failed to update status");
        
        document.getElementById(`status-${id}`).textContent = status; // Update status dynamically
    } catch (error) {
        console.error("Error updating status:", error);
    }
}