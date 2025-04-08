document.addEventListener("DOMContentLoaded", () => {
    fetchEvents();
    document.getElementById("eventForm").addEventListener("submit", uploadEvent);
});

// Use a base URL that switches based on the environment.


// Helper function to get the JWT token from localStorage.
function getToken() {
    return localStorage.getItem("authToken"); // Ensure token is set upon login.
}


// ✅ Fetch and display all events (no authentication required)
async function fetchEvents() {
    try {
        const response = await fetch(`https://afterthoughts.onrender.com/api/events/`);
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
        const response = await fetch(`https://afterthoughts.onrender.com/api/events/${eventId}`);
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

// ✅ Upload a new event (admin only)
async function uploadEvent(e) {
    e.preventDefault();

    // Retrieve the auth token
    const token = getToken();
    console.log(token);
    if (!token) {
        alert("You must be logged in as an admin to upload events.");
        return;
    }

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("image", document.getElementById("image").files[0]);
    formData.append("description", document.getElementById("description").value);
    formData.append("date", document.getElementById("date").value);
    formData.append("details", document.getElementById("details").value);

    console.log("📩 Sending Form Data:", [...formData.entries()]);

    try {
        const response = await fetch(`https://afterthoughts.onrender.com/api/events/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
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

// ✅ Delete an event (admin only)
async function deleteEvent(eventId) {
    if (!confirm("⚠️ Are you sure you want to delete this event?")) return;

    // Retrieve the auth token
    const token = getToken();
    if (!token) {
        alert("You must be logged in as an admin to delete events.");
        return;
    }

    console.log("🗑️ Deleting Event ID:", eventId);

    try {
        const response = await fetch(`https://afterthoughts.onrender.com/api/events/${eventId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
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
