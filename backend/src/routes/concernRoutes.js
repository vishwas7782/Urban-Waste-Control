const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const concern = require('../controllers/concernController');

// Public users
router.post('/raise-concern', authenticateToken, requireRole('user'), concern.raiseConcern);
router.get('/view-user-concerns', authenticateToken, requireRole('user'), concern.viewUserConcerns);

// Municipal employees
router.get('/view-concerns', authenticateToken, requireRole('municipal'), concern.viewConcerns);
router.patch('/mark-solved/:id', authenticateToken, requireRole('municipal'), concern.markSolved);
router.delete('/delete-concern/:id', authenticateToken, requireRole('municipal'), concern.deleteConcern);

module.exports = router;
