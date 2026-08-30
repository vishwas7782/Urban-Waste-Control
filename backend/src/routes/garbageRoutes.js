const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const garbage = require('../controllers/garbageController');

router.post('/report-public-garbage', authenticateToken, upload.single('garbageImage'), garbage.reportGarbage);
router.get('/view-garbage-reports', authenticateToken, requireRole('municipal'), garbage.viewGarbageReports);
router.patch('/mark-solved-garbage/:id', authenticateToken, requireRole('municipal'), garbage.markGarbageResolved);
router.delete('/delete-garbage/:id', authenticateToken, requireRole('municipal'), garbage.deleteGarbage);

module.exports = router;
