const Transaction = require('../models/transaction');
const Merchant = require('../models/merchant');
const AuditLog = require('../models/auditLog');

exports.processPayment = async (req, res) => {
  try {
    const { amount, merchantId, paymentMethod, currency = 'USD' } = req.body;
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(400).json({ message: 'Merchant not found' });
    }

    if (merchant.status && merchant.status !== 'active') {
      return res.status(400).json({ message: 'Merchant is disabled' });
    }

    const transaction = new Transaction({
      userId: req.userId,
      merchantId,
      amount,
      currency,
      paymentMethod,
      status: 'completed',
      processedAt: new Date(),
    });
    await transaction.save();

    await AuditLog.create({
      actorUserId: req.userId,
      action: 'payment.processed',
      entityType: 'Transaction',
      entityId: transaction._id.toString(),
      details: {
        merchantId,
        amount,
        currency,
        paymentMethod,
      },
    });

    res.json({ message: 'Payment processed successfully', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('merchantId', 'name status');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { transactionId, refundReason } = req.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(400).json({ message: 'Transaction not found' });
    }
    if (transaction.status === 'refunded') {
      return res.status(400).json({ message: 'Transaction is already refunded' });
    }
    transaction.status = 'refunded';
    transaction.refundReason = refundReason || transaction.refundReason;
    transaction.processedAt = new Date();
    await transaction.save();

    await AuditLog.create({
      actorUserId: req.userId,
      action: 'payment.refunded',
      entityType: 'Transaction',
      entityId: transaction._id.toString(),
      details: {
        refundReason: refundReason || null,
      },
    });

    res.json({ message: 'Refund processed successfully', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};