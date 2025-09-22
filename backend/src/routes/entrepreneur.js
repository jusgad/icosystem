const express = require('express');
const router = express.Router();
const entrepreneurController = require('../controllers/entrepreneurController');
const { authenticateToken, isEntrepreneur } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, isEntrepreneur, entrepreneurController.getDashboard);
router.put('/lifecycle', authenticateToken, isEntrepreneur, entrepreneurController.updateLifecycleForm);
router.get('/lifecycle/questions', authenticateToken, isEntrepreneur, entrepreneurController.getLifecycleQuestions);

module.exports = router;