document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("submissionForm");
    const statusMessage = document.getElementById("statusMessage");
    const loadingIndicator = document.getElementById("loading");
    const token = localStorage.getItem("authToken");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        loadingIndicator.style.display = "block";
        statusMessage.innerHTML = "";

        // Create a new FormData object from the form
        const formData = new FormData(form);

        // Check if a document file is provided
        const docInput = document.getElementById("document");
        if (docInput.files.length > 0) {
            const docFile = docInput.files[0];

            // If the file is a PDF, convert it to text
            if (docFile.type === "application/pdf") {
                try {
                    const textFromPdf = await convertPdfToText(docFile);
                    // Append the extracted text to the formData under "text"
                    formData.append("text", textFromPdf);
                } catch (error) {
                    console.error("Error converting PDF to text:", error);
                    statusMessage.innerHTML = `<p style="color: red;">Error converting PDF to text.</p>`;
                    loadingIndicator.style.display = "none";
                    return;
                }
            }
        } else {
            // If no document is provided, ensure the "text" field exists (could be empty)
            formData.append("text", "");
        }

        // Submit the article data
        submitArticle(formData);
    });

    // Function to convert PDF file to text using pdf.js
    async function convertPdfToText(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let textContent = "";
                    // Loop through each page of the PDF and extract text
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const strings = content.items.map(item => item.str);
                        textContent += strings.join(" ") + "\n";
                    }
                    resolve(textContent);
                } catch (error) {
                    reject(error);
                }
            };
            fileReader.onerror = function(error) {
                reject(error);
            };
            fileReader.readAsArrayBuffer(file);
        });
    }

    // Function to submit the article to the backend API
    async function submitArticle(formData) {
        try {
            const response = await fetch("https://afterthoughts.onrender.com/api/articles/add", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Do not set Content-Type; browser sets it automatically for FormData.
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
