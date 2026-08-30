const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const schedule = require('../controllers/scheduleController');

router.post('/update-schedule', authenticateToken, requireRole('municipal'), schedule.updateSchedule);
router.get('/view-schedule', authenticateToken, schedule.viewSchedule);
router.get('/public-schedule', schedule.publicSchedule);

module.exports = router;
