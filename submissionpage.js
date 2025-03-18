document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("submissionForm");
    const statusMessage = document.getElementById("statusMessage");
    const loadingIndicator = document.getElementById("loading");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        loadingIndicator.style.display = "block";
        statusMessage.innerHTML = "";

        const formData = new FormData(form);

       

        try {
            const response = await fetch("https://afterthoughts.onrender.com/api/articles  ", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}` // ✅ Include token
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

document.getElementById("document").addEventListener("change", function() {
    document.getElementById("documentName").textContent = this.files[0] ? this.files[0].name : "No Document chosen";
});

document.getElementById("picture").addEventListener("change", function() {
    document.getElementById("pictureName").textContent = this.files[0] ? this.files[0].name : "No file chosen";
});
