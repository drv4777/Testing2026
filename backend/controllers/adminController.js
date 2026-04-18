const Merchant = require('../models/merchant');
const Transaction = require('../models/transaction');
const FraudAlert = require('../models/fraudAlert');
const AuditLog = require('../models/auditLog');

exports.createMerchant = async (req, res) => {
  try {
    const { name, apiKey, ownerUserId, status, webhookUrl, settings } = req.body;
    const merchant = new Merchant({
      name,
      apiKey,
      ownerUserId: ownerUserId || null,
      status: status || 'active',
      webhookUrl,
      settings: settings || {},
    });
    await merchant.save();

    await AuditLog.create({
      actorUserId: req.userId,
      action: 'merchant.created',
      entityType: 'Merchant',
      entityId: merchant._id.toString(),
      details: {
        name,
      },
    });

    res.status(201).json({ message: 'Merchant created successfully', merchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const totalMerchants = await Merchant.countDocuments();
    const openFraudAlerts = await FraudAlert.countDocuments({ status: 'open' });
    const totalRevenue = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const averageTransactionValue = totalRevenue.length > 0 ? totalRevenue[0].total / totalTransactions : 0;

    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const failedTransactions = await Transaction.countDocuments({ status: 'failed' });
    const refundedTransactions = await Transaction.countDocuments({ status: 'refunded' });

    const analyticsData = {
      totalTransactions,
      totalMerchants,
      openFraudAlerts,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      averageTransactionValue,
      transactionStatus: {
        completed: completedTransactions,
        pending: pendingTransactions,
        failed: failedTransactions,
        refunded: refundedTransactions,
      },
    };

    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find().sort({ createdAt: -1 }).populate('ownerUserId', 'username email role status');
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const deletedMerchant = await Merchant.findByIdAndDelete(merchantId);
    if (!deletedMerchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    await AuditLog.create({
      actorUserId: req.userId,
      action: 'merchant.deleted',
      entityType: 'Merchant',
      entityId: merchantId,
      details: {
        name: deletedMerchant.name,
      },
    });

    res.json({ message: 'Merchant deleted successfully', deletedMerchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { name, apiKey, ownerUserId, status, webhookUrl, settings } = req.body;
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      merchantId,
      {
        ...(name !== undefined ? { name } : {}),
        ...(apiKey !== undefined ? { apiKey } : {}),
        ...(ownerUserId !== undefined ? { ownerUserId } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(webhookUrl !== undefined ? { webhookUrl } : {}),
        ...(settings !== undefined ? { settings } : {}),
      },
      { new: true }
    );
    if (!updatedMerchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    await AuditLog.create({
      actorUserId: req.userId,
      action: 'merchant.updated',
      entityType: 'Merchant',
      entityId: merchantId,
      details: {
        name,
        status,
      },
    });

    res.json({ message: 'Merchant updated successfully', updatedMerchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};