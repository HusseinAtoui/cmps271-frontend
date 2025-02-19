// Define the events array
const events = [
    {
        image: "fruit.jpg",
        title: "Event 1",
        description: "This is the description of Event 1.",
        date: "2023-10-01"
    },
    {
        image: "muisc.jpg",
        title: "Event 2",
        description: "This is the description of Event 2.",
        date: "2023-10-05"
    },
    {
        image: "store.jpg",
        title: "Event 3",
        description: "This is the description of Event 3.",
        date: "2023-10-10"
    },
    {
        image: "kisses.jpg",
        title: "Event 4",
        description: "This is the description of Event 4.",
        date: "2023-10-15"
    }
];

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
        dateElement.textContent = `Date: ${event.date}`; 
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

// Call the function to display events
makeEvent(events);

// Initialize FullCalendar when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('tempcal');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', 
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'Event 1',
                start: '2023-10-01'
            },
            {
                title: 'Event 2',
                start: '2023-10-05',
                end: '2023-10-07'
            }
        ]
    });
    calendar.render(); 
});