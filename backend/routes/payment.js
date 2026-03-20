const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/process', authMiddleware, paymentController.processPayment);
router.get('/history', authMiddleware, paymentController.getTransactionHistory);
router.post('/refund', authMiddleware, paymentController.refundPayment);

module.exports = router;