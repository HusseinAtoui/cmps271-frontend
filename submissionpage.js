document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("submissionForm");
    const statusMessage = document.getElementById("statusMessage");
    const loadingIndicator = document.getElementById("loading");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        loadingIndicator.style.display = "block";
        statusMessage.innerHTML = "";

        const formData = new FormData(form);

        // ✅ Get token from localStorage (assuming user logged in)
        const token = localStorage.getItem("authToken");

        if (!token) {
            statusMessage.innerHTML = `<p style="color: red;">You need to log in first!</p>`;
            loadingIndicator.style.display = "none";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/articles  ", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}` // ✅ Include token
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                statusMessage.innerHTML = `<p style="color: green;">Submission successful!</p>`;
                form.reset();
            } else {
                statusMessage.innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
            }
        } catch (error) {
            console.error("Network error:", error);
            statusMessage.innerHTML = `<p style="color: red;">Network error! Check console.</p>`;
        } finally {
            loadingIndicator.style.display = "none";
        }
    });
});
