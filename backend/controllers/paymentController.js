const Transaction = require('../models/transaction');
const Merchant = require('../models/merchant');

exports.processPayment = async (req, res) => {
  try {
    const { amount, merchantId, paymentMethod } = req.body;
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(400).json({ message: 'Merchant not found' });
    }

    // Simulate payment processing (replace with actual payment gateway integration)
    const transaction = new Transaction({
      userId: req.userId,
      merchantId,
      amount,
      paymentMethod,
      status: 'completed', // or 'pending', 'failed' based on simulation
    });
    await transaction.save();

    res.json({ message: 'Payment processed successfully', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(400).json({ message: 'Transaction not found' });
    }
    transaction.status = 'refunded';
    await transaction.save();
    res.json({ message: 'Refund processed successfully', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};