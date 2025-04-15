document.addEventListener('DOMContentLoaded', () => {
  const scheduleForm = document.getElementById('scheduleForm');
  const responseMessage = document.getElementById('responseMessage');
  console.log("Email element:", document.getElementById('email'));
  console.log("Meeting Date element:", document.getElementById('meetingDate'));
  scheduleForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Gather form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const meetingDate = document.getElementById('meetingDate').value;
    const message = document.getElementById('message').value;

    // Log values for debugging
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Meeting Date:", meetingDate);
    console.log("Message:", message);

    // Create a data object to send to the server
    const data = { name, email, meetingDate, message };

    try {
      // Send POST request to the backend endpoint
      const response = await fetch("https://afterthoughts.onrender.com/api/schedule", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      // Display message from the backend
      responseMessage.textContent = result.message || result.error;

      // Reset the form on success
      if (response.ok) {
        scheduleForm.reset();
      }
    } catch (error) {
      console.error('Error:', error);
      responseMessage.textContent = `Error: ${error.message}`;
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  
  // Function to fetch meetings from the backend
  async function fetchMeetings() {
    try {
      const response = await fetch("https://afterthoughts.onrender.com/api/schedule"); // Adjust endpoint as needed
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const meetings = await response.json();
      displayMeetings(meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Optionally display an error message on the page
      document.getElementById('meetingsContainer').textContent = 'Error loading meetings.';
    }
  }

  // Function to display meetings in a container
  function displayMeetings(meetings) {
    const meetingsContainer = document.getElementById('meetingsContainer');
    meetingsContainer.innerHTML = ''; // Clear previous content

    if (!meetings || meetings.length === 0) {
      meetingsContainer.innerHTML = '<p>No meetings scheduled.</p>';
      return;
    }

    meetings.forEach(meeting => {
      // Create a meeting card element for each meeting
      const meetingDiv = document.createElement('div');
      meetingDiv.classList.add('meeting-card');
      
      // Format the meeting date
      const formattedDate = new Date(meeting.meetingDate).toLocaleString();

      meetingDiv.innerHTML = `
        <p><strong>Name:</strong> ${meeting.name}</p>
        <p><strong>Email:</strong> ${meeting.email}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Message:</strong> ${meeting.message}</p>
      `;
      meetingsContainer.appendChild(meetingDiv);
    });
  }

  // Call fetchMeetings on page load to display all meetings
  fetchMeetings();
});

