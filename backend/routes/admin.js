const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/merchant', authMiddleware, adminController.createMerchant);
router.get('/analytics', authMiddleware, adminController.getAnalytics);

module.exports = router;