const express = require('express');
const router = express.Router();
const fraudController = require('../controllers/fraudController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/alerts', authMiddleware, fraudController.getFraudAlerts);
router.post('/resolve', authMiddleware, fraudController.resolveFraudAlert);

module.exports = router;