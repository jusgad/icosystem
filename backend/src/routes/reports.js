const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { reportValidation } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');

// Rate limiting para reportes
router.use(rateLimiters.reports);

router.get('/impact-metrics',
  authenticateToken,
  authorizeRoles('super_user', 'client'),
  reportValidation.getMetrics,
  reportController.getImpactMetrics
);

router.get('/entrepreneur-directory',
  authenticateToken,
  authorizeRoles('super_user', 'client'),
  reportController.getEntrepreneurDirectory
);

router.get('/progress-report',
  authenticateToken,
  authorizeRoles('super_user', 'client'),
  reportController.generateProgressReport
);

router.get('/activity-metrics',
  authenticateToken,
  authorizeRoles('super_user', 'client'),
  reportController.getActivityMetrics
);

module.exports = router;