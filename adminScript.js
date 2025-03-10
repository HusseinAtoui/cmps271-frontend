document.addEventListener("DOMContentLoaded", () => {
    fetchEvents();
    document.getElementById("eventForm").addEventListener("submit", uploadEvent);
});

// ✅ Fetch and display all events
async function fetchEvents() {
    try {
        const response = await fetch('http://localhost:3000/api/events/');
        const events = await response.json();
        const eventList = document.getElementById("eventList");

        eventList.innerHTML = ""; // Clear previous events

        events.forEach(event => {
            const eventItem = document.createElement("div");
            eventItem.classList.add("event-item");
            eventItem.innerHTML = `
                <h3>${event.title}</h3>
                <img src="${event.image}" alt="${event.title}" width="150">
                <p>${event.description}</p>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p>${event.details}</p>
                <button onclick="fetchEventById('${event._id}')">View Details</button>
                <button class="delete-btn" onclick="deleteEvent('${event._id}')">Delete</button>
            `;
            eventList.appendChild(eventItem);
        });

    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}

// ✅ Fetch and display a single event by ID
async function fetchEventById(eventId) {
    try {
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`);
        const event = await response.json();

        if (!response.ok) {
            alert("❌ Error fetching event: " + event.error);
            return;
        }

        alert(`📅 Event: ${event.title}\n📆 Date: ${new Date(event.date).toLocaleDateString()}\n📝 Details: ${event.details}`);
    } catch (error) {
        console.error("❌ Error fetching event:", error);
    }
}

// ✅ Upload a new event
async function uploadEvent(event) {
    event.preventDefault();

    const token = localStorage.getItem("authToken"); 
    if (!token) {
        alert("❌ You are not authenticated. Please log in again.");
        return;
    }

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("image", document.getElementById("image").files[0]);
    formData.append("description", document.getElementById("description").value);
    formData.append("date", document.getElementById("date").value);
    formData.append("details", document.getElementById("details").value);

    console.log("📩 Sending Form Data:", [...formData.entries()]);
    console.log("🔑 Sending Token in Headers:", `Bearer ${token}`);

    try {
        const response = await fetch("http://localhost:3000/api/events", {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            console.error("❌ Server Response:", responseData);
            throw new Error(responseData.error || "Unknown error occurred");
        }

        alert("✅ Event uploaded successfully!");
        fetchEvents();
        document.getElementById("eventForm").reset();
    } catch (error) {
        console.error("❌ Error uploading event:", error);
        alert(`Error: ${error.message || "Something went wrong"}`);
    }
}


async function deleteEvent(eventId) {
    if (!confirm("⚠️ Are you sure you want to delete this event?")) return;

    const token = localStorage.getItem("authToken"); // Ensure token is retrieved
    if (!token) {
        alert("❌ You are not authenticated. Please log in again.");
        return;
    }

    console.log("🗑️ Deleting Event ID:", eventId);
    console.log("🔑 Sending Token:", `Bearer ${token}`);

    try {
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            } 
        });

        const responseData = await response.json();
        console.log("📌 Server Response:", responseData);

        if (!response.ok) {
            throw new Error(responseData.error || "Unknown error occurred");
        }

        alert("✅ Event deleted successfully!");
        fetchEvents(); // Refresh event list after deletion
    } catch (error) {
        console.error("❌ Error deleting event:", error);
        alert(`Error: ${error.message || "Something went wrong"}`);
    }
}
