exports.getFraudAlerts = async (req, res) => {
    try {
      // Simulate fraud alerts (replace with actual logic)
      const fraudAlerts = [
        { id: 1, transactionId: '123', reason: 'High transaction amount' },
        { id: 2, transactionId: '456', reason: 'Unusual location' },
      ];
      res.json(fraudAlerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.resolveFraudAlert = async (req, res) => {
    try {
      const { alertId, resolution } = req.body;
      // Simulate resolving fraud alert (replace with actual logic)
      res.json({ message: `Fraud alert ${alertId} resolved with ${resolution}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };