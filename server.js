const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;


app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));


const schedules = {
    "Rajeev Nagar": [
        { day: "Monday", time: "7:00 AM" },
        { day: "Wednesday", time: "7:00 AM" },
        { day: "Friday", time: "7:00 AM" },
    ],
    "Aanad Nagar": [
        { day: "Tuesday", time: "8:00 AM" },
        { day: "Thursday", time: "8:00 AM" },
    ],
    "Bhawna Nagar": [
        { day: "Saturday", time: "9:00 AM" },
        { day: "Sunday", time: "9:00 AM" },
    ],
    "piplani": [
        { day: "Monday", time: "8:00 AM" },
        { day: "Wednesday", time: "8:00 AM" },
        { day: "Friday", time: "8:00 AM" },
    ],
};

// Endpoint to get schedule by location
app.post('/api/schedule', (req, res) => {
    const { location } = req.body;

    if (schedules[location]) {
        res.json({ success: true, schedule: schedules[location] });
    } else {
        res.json({ success: false, message: "Schedule not found for this location." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
