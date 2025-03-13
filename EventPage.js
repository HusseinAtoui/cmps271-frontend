// Function to fetch and display events from the backend
async function fetchEvents() {
    try {
        const response = await fetch('https://afterthoughts.onrender.com/api/events/');
        const events = await response.json();
        makeEvent(events); // Call makeEvent with fetched data
        initializeCalendar(events); // Call FullCalendar with fetched events
    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}

// Function to create and display events
function makeEvent(events) {
    const allEvents = document.getElementById("currentEvents");

    // Clear existing content
    allEvents.innerHTML = ''; 

    // Loop through each event and create its HTML structure
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('Event');

        // Create image element
        const imageElement = document.createElement('img');
        imageElement.src = event.image; 
        imageElement.alt = event.title; 
        imageElement.classList.add('decorations'); 
        eventElement.appendChild(imageElement);

        // Create text container
        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');

        // Add date
        const dateElement = document.createElement('h5');
        dateElement.textContent = `Date: ${new Date(event.date).toLocaleDateString()}`; 
        textContainer.appendChild(dateElement);
        
        // Add title
        const titleElement = document.createElement('h3');
        titleElement.textContent = event.title; 
        textContainer.appendChild(titleElement);

        // Add description
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = event.description; 
        textContainer.appendChild(descriptionElement);
        
        // Append text container to event element
        eventElement.appendChild(textContainer);

        // Append event element to the main container
        allEvents.appendChild(eventElement);
    });
}

// Function to initialize FullCalendar with events from backend
document.addEventListener('DOMContentLoaded', function() {
    fetchEvents(); // Fetch events when the DOM loads
});

function initializeCalendar(events) {
    var calendarEl = document.getElementById('tempcal');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', 
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events.map(event => ({
            title: event.title,
            start: event.date
        })) // Convert backend events to FullCalendar format
    });
    calendar.render();
}
