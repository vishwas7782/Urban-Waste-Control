// Handle Signup
document.getElementById('signupForm')?.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form from refreshing the page

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('role').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        // Send POST request to signup API
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();
        if (data.success) {
            // Signup successful, store JWT token and role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role); // Store user role

            // Redirect to the correct dashboard based on role
            if (data.role === 'municipal') {
                window.location.href = 'municipal-dashboard.html'; // Redirect to municipal employee dashboard
            } else {
                window.location.href = 'public-dashboard.html'; // Redirect to public user dashboard
            }
        } else {
            // Show error if signup failed
            alert('Signup failed: ' + data.message);
        }
    } catch (error) {
        // Show error if there's a problem with the request
        alert('Error: ' + error);
    }
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form from refreshing the page

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Send POST request to login API
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            // Login successful, store JWT token and role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role); // Store user role

            // Redirect to the correct dashboard based on role
            if (data.role === 'municipal') {
                window.location.href = 'municipal-dashboard.html'; // Redirect to municipal employee dashboard
            } else {
                window.location.href = 'public-dashboard.html'; // Redirect to public user dashboard
            }
        } else {
            // Show error if login failed
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        // Show error if there's a problem with the request
        alert('Error: ' + error);
    }
});

// Check if user is logged in
function checkLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must log in to access the dashboard');
        window.location.href = 'login.html'; // Redirect to login page if not logged in
    }
}

// Search for garbage collection schedule (public user functionality)
async function searchSchedule() {
    const area = document.getElementById('searchArea').value;

    try {
        const response = await fetch(`/view-schedule`, {
            headers: {
                'Authorization': localStorage.getItem('token') // Add the token from localStorage
            }
        });
        
        const data = await response.json();
        const scheduleDiv = document.getElementById('schedule');
        scheduleDiv.innerHTML = ''; // Clear previous content

        // Check if the schedule array is empty
        if (!data.schedules.length) {
            scheduleDiv.innerHTML = `<p>No schedules available for "${area}".</p>`;
            return;
        }

        // Filter and display the schedule
        data.schedules.forEach(schedule => {
            if (schedule.area.toLowerCase().includes(area.toLowerCase())) {
                scheduleDiv.innerHTML += `<div class="schedule-item"><p><strong>${schedule.date} - ${schedule.time}</strong></p><p>Area: ${schedule.area}</p></div>`;
            }
        });
    } catch (error) {
        alert('Error loading schedule: ' + error);
    }
}

// Submit a concern for public users
async function submitConcern(event) {
    event.preventDefault();
    const concernData = {
        name: document.getElementById('name').value,
        houseNumber: document.getElementById('houseNumber').value,
        locality: document.getElementById('locality').value,
        mobileNum: document.getElementById('mobileNum').value,
        issueType: document.getElementById('issueType').value,
        additionalDetails: document.getElementById('additionalDetails').value,
    };

    try {
        const response = await fetch('/raise-concern', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token') // Add the token from localStorage
            },
            body: JSON.stringify(concernData)
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Concern raised successfully');
            // Clear the form fields
            document.getElementById('raiseConcernForm').reset(); // Clear the form
        } else {
            alert('Error raising concern: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error);
    }
}

// Report garbage at a public place
async function reportGarbage(event) {
    event.preventDefault();
    const garbageData = {
        location: document.getElementById('location').value,
        locality: document.getElementById('locationLocality').value,
        mobileNum: document.getElementById('publicMobileNum').value,
        additionalDetails: document.getElementById('publicAdditionalDetails').value,
        image: document.getElementById('garbageImage').files[0]
    };

    const formData = new FormData();
    Object.keys(garbageData).forEach(key => formData.append(key, garbageData[key]));

    try {
        const response = await fetch('/report-public-garbage', {
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token') // Add the token from localStorage
            },
            body: formData // Send formData (including image)
        });

        const data = await response.json();
        if (data.success) {
            alert('Garbage reported successfully');
            // Clear the form fields
            document.getElementById('publicGarbageForm').reset(); // Clear the form
        } else {
            alert('Error reporting garbage: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error);
    }
}
