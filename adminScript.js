document.addEventListener("DOMContentLoaded", () => {
    fetchEvents();
    document.getElementById("eventForm").addEventListener("submit", uploadEvent);
});

// ✅ Fetch and display all events
async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
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
        console.error("Error fetching events:", error);
    }
}

// ✅ Fetch and display a single event by ID
async function fetchEventById(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`);
        const event = await response.json();

        if (!response.ok) {
            alert("Error fetching event: " + event.error);
            return;
        }

        // Display event details in a modal or alert (You can improve UI later)
        alert(`Event: ${event.title}\nDate: ${new Date(event.date).toLocaleDateString()}\nDetails: ${event.details}`);
    } catch (error) {
        console.error("Error fetching event:", error);
    }
}

// ✅ Upload a new event
async function uploadEvent(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("image", document.getElementById("image").files[0]); // File upload
    formData.append("description", document.getElementById("description").value);
    formData.append("date", document.getElementById("date").value);
    formData.append("details", document.getElementById("details").value);

    try {
        const response = await fetch('/api/events', {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}` // Ensure user authentication
            }
        });

        if (response.ok) {
            alert("Event uploaded successfully!");
            fetchEvents(); // Refresh event list
            document.getElementById("eventForm").reset(); // Clear form
        } else {
            const error = await response.json();
            alert("Error: " + error.message);
        }
    } catch (error) {
        console.error("Error uploading event:", error);
    }
}

// ✅ Delete an event
async function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            alert("Event deleted successfully!");
            fetchEvents(); // Refresh event list after deletion
        } else {
            const error = await response.json();
            alert("Error: " + error.message);
        }
    } catch (error) {
        console.error("Error deleting event:", error);
    }
}
