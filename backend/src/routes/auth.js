const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');

// Aplicar rate limiting estricto a autenticación
router.use(rateLimiters.auth);

router.post('/register', authValidation.register, authController.register);
router.post('/login', authValidation.login, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authValidation.updateProfile, authController.updateProfile);

module.exports = router;