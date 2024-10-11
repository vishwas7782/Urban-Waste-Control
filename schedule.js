document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = document.getElementById('scheduleForm');
    const scheduleResults = document.getElementById('scheduleResults');
    const scheduleList = document.getElementById('scheduleList');
    const userLocation = document.getElementById('userLocation');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');

    scheduleForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get the entered location
        const location = document.getElementById('location').value.trim();

        if (location === '') {
            alert('Please enter your location.');
            return;
        }

        // Clear previous results and errors
        scheduleList.innerHTML = '';
        scheduleResults.style.display = 'none';
        errorMessage.style.display = 'none';

        // Show loading indicator
        loading.style.display = 'block';

        // Send the location to the backend to fetch the schedule
        fetch('http://localhost:3000/api/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location: location })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.message || 'Failed to fetch schedule.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide loading indicator
            loading.style.display = 'none';

            if (data.success) {
                // Display the schedule
                userLocation.textContent = location;
                data.schedule.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.day} - ${item.time}`;
                    scheduleList.appendChild(li);
                });
                scheduleResults.style.display = 'block';
            } else {
                // Display the error message
                errorMessage.textContent = data.message || 'Schedule not found.';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching schedule:', error);
            loading.style.display = 'none';
            errorMessage.textContent = error.message || 'An error occurred while fetching the schedule.';
            errorMessage.style.display = 'block';
        });
    });
});
