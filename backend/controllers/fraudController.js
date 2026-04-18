const FraudAlert = require('../models/fraudAlert');

exports.getFraudAlerts = async (req, res) => {
  try {
    const fraudAlerts = await FraudAlert.find()
      .sort({ createdAt: -1 })
      .populate('transactionId', 'amount currency status createdAt')
      .populate('userId', 'username role')
      .populate('merchantId', 'name status')
      .populate('resolvedBy', 'username role');

    res.json(fraudAlerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveFraudAlert = async (req, res) => {
  try {
    const { alertId } = req.body;
    const fraudAlert = await FraudAlert.findById(alertId);

    if (!fraudAlert) {
      return res.status(404).json({ message: 'Fraud alert not found' });
    }

    fraudAlert.status = 'resolved';
    fraudAlert.resolvedBy = req.userId;
    fraudAlert.resolvedAt = new Date();
    await fraudAlert.save();

    res.json({ message: 'Fraud alert resolved successfully', fraudAlert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};