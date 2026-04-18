import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { processPayment } from '../../actions/paymentActions';
import { getMerchants } from '../../actions/adminActions';
import TransactionStatus from './TransactionStatus';

function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currency, setCurrency] = useState('USD');

  const merchants = useSelector((state) => state.admin.merchants);
  const merchantsLoading = useSelector((state) => state.admin.merchantsLoading);
  const merchantError = useSelector((state) => state.admin.error);
  const paymentError = useSelector((state) => state.payment.error);
  const processing = useSelector((state) => state.payment.processing);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMerchants());
  }, [dispatch]);

  const activeMerchants = useMemo(
    () => merchants.filter((merchant) => !merchant.status || merchant.status === 'active'),
    [merchants]
  );

  useEffect(() => {
    if (!merchantId && activeMerchants.length > 0) {
      setMerchantId(activeMerchants[0]._id);
    }
  }, [activeMerchants, merchantId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0 || !merchantId) {
      return;
    }

    dispatch(processPayment(parsedAmount, merchantId, paymentMethod, currency));
  };

  return (
    <div className="payment-page">
      <div className="payment-panel">
        <h2>Make a Payment</h2>
        <p className="payment-subtitle">Select a merchant and submit a transaction using the new schema fields.</p>

        <form onSubmit={handleSubmit} className="payment-form" noValidate>
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label htmlFor="currency">Currency</label>
          <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>

          <label htmlFor="merchant">Merchant</label>
          <select
            id="merchant"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            disabled={merchantsLoading || activeMerchants.length === 0}
            required
          >
            {activeMerchants.length === 0 && <option value="">No active merchants available</option>}
            {activeMerchants.map((merchant) => (
              <option key={merchant._id} value={merchant._id}>
                {merchant.name}
              </option>
            ))}
          </select>

          {merchantsLoading && <p className="form-hint">Loading merchants...</p>}

          <label htmlFor="method">Payment Method</label>
          <select id="method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="wallet">Wallet</option>
          </select>

          {merchantError && <p className="form-error">Unable to load merchants: {merchantError}</p>}
          {paymentError && <p className="form-error">Payment failed: {paymentError}</p>}

          <button type="submit" disabled={processing || merchantsLoading || activeMerchants.length === 0}>
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </form>

        <TransactionStatus />
      </div>
    </div>
  );
}

export default PaymentForm;