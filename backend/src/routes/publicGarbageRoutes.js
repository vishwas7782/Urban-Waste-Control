const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const publicGarbage = require('../controllers/publicGarbageController');

router.post('/report-public-garbage-no-login', upload.single('publicGarbageImage'), publicGarbage.reportPublicGarbage);
router.get('/view-public-garbage-reports', authenticateToken, requireRole('municipal'), publicGarbage.viewPublicGarbageReports);
router.patch('/mark-solved-public-garbage/:id', authenticateToken, requireRole('municipal'), publicGarbage.markPublicGarbageResolved);
router.delete('/delete-public-garbage/:id', authenticateToken, requireRole('municipal'), publicGarbage.deletePublicGarbage);

module.exports = router;
