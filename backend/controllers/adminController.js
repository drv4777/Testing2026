const Merchant = require('../models/merchant');
const Transaction = require('../models/transaction');

exports.createMerchant = async (req, res) => {
  try {
    const { name, apiKey } = req.body;
    const merchant = new Merchant({ name, apiKey });
    await merchant.save();
    res.status(201).json({ message: 'Merchant created successfully', merchant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
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
        const merchants = await Merchant.find();
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
        res.json({ message: 'Merchant deleted successfully', deletedMerchant });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateMerchant = async (req, res) => {
    try {
        const { merchantId } = req.params;
        const { name, apiKey } = req.body;
        const updatedMerchant = await Merchant.findByIdAndUpdate(
            merchantId,
            { name, apiKey },
            { new: true }
        );
        if (!updatedMerchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }
        res.json({ message: 'Merchant updated successfully', updatedMerchant });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};