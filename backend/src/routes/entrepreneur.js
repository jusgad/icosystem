const express = require('express');
const router = express.Router();
const entrepreneurController = require('../controllers/entrepreneurController');
const { authenticateToken, isEntrepreneur } = require('../middleware/auth');
const { entrepreneurValidation } = require('../middleware/validation');

router.get('/dashboard', authenticateToken, isEntrepreneur, entrepreneurController.getDashboard);
router.put('/lifecycle', authenticateToken, isEntrepreneur, entrepreneurValidation.updateLifecycle, entrepreneurController.updateLifecycleForm);
router.get('/lifecycle/questions', authenticateToken, isEntrepreneur, entrepreneurController.getLifecycleQuestions);

module.exports = router;