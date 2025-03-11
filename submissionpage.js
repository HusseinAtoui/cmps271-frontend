document.addEventListener('DOMContentLoaded', () => { 
    const form = document.getElementById('submissionForm');
    const statusMsg = document.getElementById('statusMessage');

    if (!form) {
        console.error("❌ ERROR: Form with ID 'submissionForm' not found!");
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent default form submission

        const formData = new FormData(form); 

        // Show loading message
        statusMsg.textContent = "⏳ Submitting, please wait...";
        statusMsg.style.color = "blue";

        try {
            const response = await fetch('http://localhost:3000/api/articles/', { 
                method: 'POST',
                body: formData // ✅ Sending FormData (handles file uploads)
            });

            const responseData = await response.json(); // Parse JSON response

            if (response.ok) {
                console.log("✅ Submission successful!");
                statusMsg.textContent = "✅ Submission successful! Thank you.";
                statusMsg.style.color = "green";
                form.reset();
            } else {
                console.error("❌ Submission failed:", responseData.error || responseData.message);
                statusMsg.textContent = `❌ ${responseData.error || responseData.message}`;
                statusMsg.style.color = "red";
            }
        } catch (error) {
            console.error("❌ Network error:", error);
            statusMsg.textContent = "❌ Network error. Please try again.";
            statusMsg.style.color = "red";
        }
    });
});
