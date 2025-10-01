const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticateToken } = require('../middleware/auth');
const { meetingValidation } = require('../middleware/validation');

router.post('/', authenticateToken, meetingValidation.create, meetingController.createMeeting);
router.get('/', authenticateToken, meetingController.getMeetings);
router.get('/upcoming', authenticateToken, meetingController.getUpcomingMeetings);
router.get('/entrepreneurs', authenticateToken, meetingController.getAvailableEntrepreneurs);
router.put('/:id', authenticateToken, meetingValidation.update, meetingController.updateMeeting);
router.delete('/:id', authenticateToken, meetingController.deleteMeeting);

module.exports = router;