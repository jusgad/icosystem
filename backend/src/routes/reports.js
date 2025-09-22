const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/impact-metrics', 
  authenticateToken, 
  authorizeRoles('super_user', 'client'), 
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