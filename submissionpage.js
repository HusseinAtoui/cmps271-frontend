
// Ensure correct PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("submissionForm");
    const statusMessage = document.getElementById("statusMessage");
    const loadingIndicator = document.getElementById("loading");
    const token = localStorage.getItem("authToken");


    if (!form) {
        console.error("❌ Error: Submission form not found.");
        return;
    }

    // Load saved form data from localStorage
    function loadFormData() {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'file') return; // Skip file inputs
            
            const savedValue = localStorage.getItem(`form_${form.id}_${input.name}`);
            if (savedValue !== null) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = savedValue === 'true';
                } else {
                    input.value = savedValue;
                }
            }
        });
    }

    // Save form data to localStorage with debouncing
    function setupFormAutoSave() {
        const inputs = form.querySelectorAll('input, textarea, select');
        let saveTimeout;

        function saveInputValue(input) {
            if (input.type === 'file') return;
            
            if (input.type === 'checkbox' || input.type === 'radio') {
                localStorage.setItem(`form_${form.id}_${input.name}`, input.checked);
            } else {
                localStorage.setItem(`form_${form.id}_${input.name}`, input.value);
            }
        }

        inputs.forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => saveInputValue(input), 500);
            });
        });
    }

    // Clear saved form data
    function clearFormData() {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            localStorage.removeItem(`form_${form.id}_${input.name}`);
        });
    }

    // Initialize form persistence
    loadFormData();
    setupFormAutoSave();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        loadingIndicator.style.display = "block";
        statusMessage.innerHTML = "";

        const formData = new FormData(form);

        // Ensure required fields exist
        appendIfMissing(formData, "title", "Untitled Article");
        appendIfMissing(formData, "description", "Read more about this");
        appendIfMissing(formData, "date", new Date().toISOString());
        appendIfMissing(formData, "tag", "general");

        // Handle image upload
        const imgInput = document.getElementById("picture");
        if (imgInput && imgInput.files.length > 0) {
            formData.append("image", imgInput.files[0]);
            console.log("one");
        }

        // Handle PDF conversion
        const docInput = document.getElementById("document");
        if (docInput && docInput.files.length > 0) {
            const docFile = docInput.files[0];
            if (docFile.type === "application/pdf") {
                try {
                    const textFromPdf = await convertPdfToText(docFile);
                    formData.append("text", textFromPdf);
                    if(textFromPdf){
                        formData.set("minToRead",Math.floor((textFromPdf.length/15)/60)+1);
                    }
                    
                } catch (error) {
                    console.error("❌ Error converting PDF to text:", error);
                    statusMessage.innerHTML = `<p style="color: red;">Error converting PDF to text.</p>`;
                    loadingIndicator.style.display = "none";
                    return;
                }
            } else {
                formData.append("text", "");
            }
        } else {
            formData.append("text", "");
        }
        for (let pair of formData.entries()) {
            console.log(pair);
        }

        // Submit the article
        await submitArticle(formData);
        
        // Clear saved data after successful submission
        clearFormData();
    });

    // Function to ensure a field exists in FormData
    function appendIfMissing(formData, field, defaultValue) {
        if (!formData.get(field)) {
            formData.append(field, defaultValue);
        }
    }

    // Convert PDF to text
    async function convertPdfToText(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = async function () {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let textContent = "";
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
            fileReader.onerror = function (error) {
                reject(error);
            };
            fileReader.readAsArrayBuffer(file);
        });
    }

    // Submit the article
    async function submitArticle(formData) {
        try {
            console.log("Submitting article...");

            const response = await fetch("https://afterthoughts.onrender.com/api/articles/add", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            console.log("Response Status:", response.status); // Log the response status

            const result = await response.json();
            if (response.ok) {
                
                statusMessage.innerHTML = `<p style="color: green;">Submission successful!</p>`;
                form.reset();
            } else {
                statusMessage.innerHTML = `<p style="color: red;">Error: ${result.error || result.message}</p>`;
            }
        } catch (error) {
            console.error("❌ Network error:", error);
            statusMessage.innerHTML = `<p style="color: red;">Network error! Check console.</p>`;
        } finally {
            console.log("Submission process complete.");
            loadingIndicator.style.display = "none";
        }
    }

    // File name display updates
    updateFileNameDisplay("document", "documentName");
    updateFileNameDisplay("picture", "pictureName");

    function updateFileNameDisplay(inputId, displayId) {
        const inputElement = document.getElementById(inputId);
        const displayElement = document.getElementById(displayId);
        if (inputElement && displayElement) {
            inputElement.addEventListener("change", function () {
                displayElement.textContent = this.files[0] ? this.files[0].name : "No file chosen";
            });
        }
    }
});

/* =============================
   nav bar
   ============================= */

const navbar = document.getElementById('navbar');

function openSideBar() {
    navbar.classList.add('show');
}

function closeSideBar() {
    navbar.classList.remove('show');
}