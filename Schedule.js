document.getElementById('scheduleForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        meetingDate: document.getElementById('meetingDate').value,
        message: document.getElementById('message').value
    };

    fetch('/api/schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('responseMessage').textContent = result.message;
            document.getElementById('scheduleForm').reset();
        })
        .catch(error => {
            document.getElementById('responseMessage').textContent = 'An error occurred.';
            console.error('Error:', error);
        });
});