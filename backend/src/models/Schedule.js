const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    employeeName: String,
    area: String,
    day: String,
    date: String,
    time: String,
});

module.exports = mongoose.model('Schedule', scheduleSchema);
