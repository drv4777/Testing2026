const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/merchant', authMiddleware, adminController.getMerchants);
router.post('/merchant', authMiddleware, adminController.createMerchant);
router.put('/merchant/:merchantId', authMiddleware, adminController.updateMerchant);
router.delete('/merchant/:merchantId', authMiddleware, adminController.deleteMerchant);
router.get('/analytics', authMiddleware, adminController.getAnalytics);

module.exports = router;