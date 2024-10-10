// Handle Signup
document.getElementById('signupForm')?.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('role').value; // Capture role

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (name && email && password && role) {
        fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }) // Include role in request
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Signup successful');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                alert('Signup failed: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error: ' + error);
        });
    } else {
        alert('Please fill in all fields');
    }
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store role in localStorage to use it later in the dashboard
                localStorage.setItem('userRole', data.role); // Store role received from server
                window.location.href = 'dashboard.html'; // Redirect to dashboard page
            } else {
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error: ' + error);
        });
    } else {
        alert('Please fill in all fields');
    }
});
