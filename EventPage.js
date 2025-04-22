document.addEventListener('DOMContentLoaded', function () {
    if (!userDataString || !token) {
        alert("Not logged in");
        // e.g. window.location.href = "/login.html";
        return;
      }
    
      // 3) Now safely parse
      let userData;
      try {
        userData = JSON.parse(userDataString);
      } catch (e) {
        console.error("Failed to parse userData:", e);
        return;
      }
    
      // 4) Update the greeting
      const userGreeting = document.getElementById("user-greeting");
      if (userGreeting) {
        userGreeting.textContent = `${userData.firstName} ${userData.lastName}`;
      }
    
      // 5) Update the profile image
      const profileImage = document.getElementById("user-profile-image");
      if (profileImage) {
        profileImage.src = userData.profilePicture || "default-profile.jpeg";
      }
    
      // 6) Fetch your events, calendar, etc.
      fetchEvents();
    });



// Function to fetch and display events from the backend
async function fetchEvents() {
    try {
        const response = await fetch('https://afterthoughts.onrender.com/api/events/');
        const events = await response.json();
        makeEvent(events); // Call makeEvent with fetched data
        initializeCalendar(events); // Initialize FullCalendar with fetched events
    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}

// Function to create and display events in HTML
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

// Function to initialize FullCalendar with events from the backend
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
            start: event.date,
            color: '#7D0D0D' // Fixed: Color value must be a string
        })) // Convert backend events to FullCalendar format
    });
    calendar.render();
}

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