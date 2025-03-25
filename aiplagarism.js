
async function detectAI() {
    const text = document.getElementById("textInput").value;
    if (!text) {
      alert("Please enter some text!");
      return;
    }
    document.getElementById("result").innerText = "Analyzing...";
    try {
      const response = await fetch("http://localhost:3000/aiplagarism/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      document.getElementById("result").innerText = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error detecting AI-generated content:", error);
      document.getElementById("result").innerText = "Error detecting AI-generated content.";
    }
  }