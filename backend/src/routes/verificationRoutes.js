const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const verification = require('../controllers/verificationController');

// Citizen-only: municipal employees must not be able to verify their own work.
router.get('/pending-verifications', authenticateToken, requireRole('user'), verification.pendingVerifications);
router.patch('/verify-concern/:id', authenticateToken, requireRole('user'), verification.verifyConcern);
router.patch('/verify-garbage/:id', authenticateToken, requireRole('user'), verification.verifyGarbage);
router.patch('/verify-public-garbage/:id', authenticateToken, requireRole('user'), verification.verifyPublicGarbage);

module.exports = router;
