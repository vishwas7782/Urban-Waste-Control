const Schedule = require('../models/Schedule');
const asyncHandler = require('../utils/asyncHandler');

// Build a case-insensitive area filter from the query string.
const areaQuery = (area) => (area ? { area: { $regex: area, $options: 'i' } } : {});

// POST /update-schedule  (municipal)
exports.updateSchedule = asyncHandler(async (req, res) => {
    const { employeeName, area, scheduleDay, scheduleDate, scheduleTime } = req.body;

    const newSchedule = new Schedule({
        employeeName,
        area,
        day: scheduleDay,
        date: scheduleDate,
        time: scheduleTime,
    });

    await newSchedule.save();
    res.status(201).json({ success: true, message: 'Schedule updated successfully' });
});

// GET /view-schedule?area=...  (authenticated)
exports.viewSchedule = asyncHandler(async (req, res) => {
    const schedules = await Schedule.find(areaQuery(req.query.area));
    res.json({ success: true, schedules });
});

// GET /public-schedule?area=...  (public)
exports.publicSchedule = asyncHandler(async (req, res) => {
    const schedules = await Schedule.find(areaQuery(req.query.area));
    res.json({ success: true, schedules });
});
