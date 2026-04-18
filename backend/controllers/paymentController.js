const Transaction = require('../models/transaction');
const Merchant = require('../models/merchant');
const AuditLog = require('../models/auditLog');
const TestCard = require('../models/testCard');

function normalizeCardNumber(cardNumber) {
  return String(cardNumber || '').replace(/\s|-/g, '');
}

function isCardExpired(testCard) {
  const now = new Date();
  return testCard.status === 'expired'
    || testCard.expYear < now.getFullYear()
    || (testCard.expYear === now.getFullYear() && testCard.expMonth < now.getMonth() + 1);
}

exports.processPayment = async (req, res) => {
  try {
    const {
      amount,
      merchantId,
      paymentMethod,
      currency = 'USD',
      cardToken,
      cardNumber,
      expMonth,
      expYear,
      cvv,
    } = req.body;
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(400).json({ message: 'Merchant not found' });
    }

    if (merchant.status && merchant.status !== 'active') {
      return res.status(400).json({ message: 'Merchant is disabled' });
    }

    let issuerDecision = {
      source: 'live',
      approved: true,
    };

    if (paymentMethod === 'card') {
      const usingManualCardEntry = Boolean(cardNumber || expMonth || expYear || cvv);
      let testCard = null;

      if (usingManualCardEntry) {
        if (!cardNumber || !expMonth || !expYear || !cvv) {
          return res.status(400).json({ message: 'cardNumber, expMonth, expYear, and cvv are required for manual card entry' });
        }

        testCard = await TestCard.findOne({ cardNumber: normalizeCardNumber(cardNumber) });
        if (!testCard) {
          return res.status(404).json({ message: 'Test card not found' });
        }

        if (String(testCard.cvv) !== String(cvv).trim()) {
          return res.status(402).json({ message: 'Card declined: CVV does not match', issuerDecision: { source: 'mock-issuer', approved: false, reason: 'cvv_mismatch' } });
        }

        if (Number(expMonth) !== Number(testCard.expMonth) || Number(expYear) !== Number(testCard.expYear)) {
          return res.status(402).json({ message: 'Card declined: expiry date does not match', issuerDecision: { source: 'mock-issuer', approved: false, reason: 'expiry_mismatch' } });
        }
      } else {
        if (!cardToken) {
          return res.status(400).json({ message: 'cardToken or manual card details are required for card payments' });
        }

        testCard = await TestCard.findOne({ token: cardToken });
        if (!testCard) {
          return res.status(404).json({ message: 'Test card not found' });
        }
      }

      if (testCard.status === 'blocked') {
        return res.status(402).json({ message: 'Card declined: card is blocked', issuerDecision: { source: 'mock-issuer', approved: false, reason: 'blocked' } });
      }

      if (isCardExpired(testCard)) {
        return res.status(402).json({ message: 'Card declined: card is expired', issuerDecision: { source: 'mock-issuer', approved: false, reason: 'expired' } });
      }

      if (Number(amount) > testCard.balance) {
        return res.status(402).json({ message: 'Card declined: insufficient balance', issuerDecision: { source: 'mock-issuer', approved: false, reason: 'insufficient_balance' } });
      }

      testCard.balance = Number((testCard.balance - Number(amount)).toFixed(2));
      await testCard.save();

      issuerDecision = {
        source: 'mock-issuer',
        approved: true,
        cardToken: testCard.token,
        last4: testCard.last4,
        brand: testCard.brand,
        remainingBalance: testCard.balance,
      };
    }

    const transaction = new Transaction({
      userId: req.userId,
      merchantId,
      amount,
      currency,
      paymentMethod,
      status: 'completed',
      processedAt: new Date(),
      gatewayReference: `mock-${Date.now()}`,
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
        issuerDecision,
      },
    });

    res.json({ message: 'Payment processed successfully', transaction, issuerDecision });
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