import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { processPayment } from '../../actions/paymentActions';
import { getMerchants } from '../../actions/adminActions';
import TransactionStatus from './TransactionStatus';

const TEST_CARDS = [
  {
    token: 'card_tok_success_001',
    label: 'Customer Visa Success',
    cardNumber: '4242424242424242',
    last4: '4242',
    expMonth: 12,
    expYear: 2030,
    cvv: '123',
    balance: 1000,
    status: 'active',
    note: 'Approves and debits balance.',
  },
  {
    token: 'card_tok_low_balance_002',
    label: 'Low Balance Mastercard',
    cardNumber: '5555555555554444',
    last4: '4444',
    expMonth: 11,
    expYear: 2030,
    cvv: '456',
    balance: 15,
    status: 'active',
    note: 'Declines when amount exceeds balance.',
  },
  {
    token: 'card_tok_blocked_003',
    label: 'Blocked Test Card',
    cardNumber: '4000000000000002',
    last4: '4000',
    expMonth: 10,
    expYear: 2030,
    cvv: '321',
    balance: 500,
    status: 'blocked',
    note: 'Always declines as blocked.',
  },
  {
    token: 'card_tok_expired_004',
    label: 'Expired Test Card',
    cardNumber: '378282246310005',
    last4: '3782',
    expMonth: 1,
    expYear: 2020,
    cvv: '1234',
    balance: 500,
    status: 'expired',
    note: 'Always declines as expired.',
  },
];

function formatCardNumberInput(value) {
  const digitsOnly = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 19);

  return digitsOnly.match(/.{1,4}/g)?.join(' ') || '';
}

function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currency, setCurrency] = useState('USD');
  const [manualCardEntry, setManualCardEntry] = useState(false);
  const [showTestCardDetails, setShowTestCardDetails] = useState(true);
  const [cardToken, setCardToken] = useState(TEST_CARDS[0].token);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('2030');
  const [cvv, setCvv] = useState('123');
  const [clientValidationError, setClientValidationError] = useState('');

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

    const missing = [];
    if (!parsedAmount || parsedAmount <= 0) {
      missing.push('amount');
    }
    if (!currency) {
      missing.push('currency');
    }
    if (!merchantId) {
      missing.push('merchant');
    }

    if (paymentMethod === 'card') {
      if (manualCardEntry) {
        if (!cardNumber || !expMonth || !expYear || !cvv) {
          missing.push('card details');
        }
      } else if (!cardToken) {
        missing.push('card details');
      }
    }

    if (missing.length > 0) {
      setClientValidationError(`Please fill out required fields: ${[...new Set(missing)].join(', ')}`);
      return;
    }

    setClientValidationError('');

    dispatch(
      processPayment(
        parsedAmount,
        merchantId,
        paymentMethod,
        currency,
        paymentMethod === 'card' && !manualCardEntry ? cardToken : '',
        paymentMethod === 'card' && manualCardEntry ? cardNumber : '',
        paymentMethod === 'card' && manualCardEntry ? expMonth : '',
        paymentMethod === 'card' && manualCardEntry ? expYear : '',
        paymentMethod === 'card' && manualCardEntry ? cvv : ''
      )
    );
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
          <select
            id="method"
            value={paymentMethod}
            onChange={(e) => {
              const nextMethod = e.target.value;
              setPaymentMethod(nextMethod);
              if (nextMethod !== 'card') {
                setCardToken('');
                setManualCardEntry(false);
              } else if (!cardToken) {
                setCardToken(TEST_CARDS[0].token);
              }
            }}
          >
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="wallet">Wallet</option>
          </select>

          {paymentMethod === 'card' && (
            <>
              <div className="card-entry-toggle-row">
                <label className="toggle-label" htmlFor="manualCardEntry">
                  <input
                    id="manualCardEntry"
                    type="checkbox"
                    checked={manualCardEntry}
                    onChange={(e) => setManualCardEntry(e.target.checked)}
                  />
                  Enter card details manually
                </label>
              </div>

              {!manualCardEntry && (
                <>
                  <label htmlFor="testCard">Mock Test Card</label>
                  <select id="testCard" value={cardToken} onChange={(e) => setCardToken(e.target.value)}>
                    {TEST_CARDS.map((testCard) => (
                      <option key={testCard.token} value={testCard.token}>
                        {testCard.label} •••• {testCard.last4} • {testCard.status}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {manualCardEntry && (
                <div className="manual-card-panel">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    pattern="[0-9\s-]*"
                    title="Use digits only. Spaces and hyphens are allowed."
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                  />

                  <div className="manual-card-inline-grid">
                    <div>
                      <label htmlFor="expMonth">Expiry Month</label>
                      <input
                        id="expMonth"
                        type="number"
                        min="1"
                        max="12"
                        autoComplete="cc-exp-month"
                        placeholder="12"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="expYear">Expiry Year</label>
                      <input
                        id="expYear"
                        type="number"
                        min="2000"
                        autoComplete="cc-exp-year"
                        placeholder="2030"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv">CVV</label>
                      <input
                        id="cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>

                  <p className="form-hint">Use the seeded mock card details only. The backend will validate number, expiry, and CVV against the test issuer database.</p>
                  <p className="form-hint">Card numbers must be digits only. Spaces and hyphens are allowed while typing.</p>
                </div>
              )}

              <div className="test-card-panel">
                <div className="test-card-header">
                  <p className="form-hint"><strong>Test card details:</strong></p>
                  <button
                    type="button"
                    className="toggle-sensitive-btn"
                    onClick={() => setShowTestCardDetails((prev) => !prev)}
                  >
                    {showTestCardDetails ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showTestCardDetails && (
                  <>
                    {TEST_CARDS.map((testCard) => (
                      <div key={testCard.token} className="test-card-item">
                        <div>
                          <strong>{testCard.label}</strong>
                          <p className="test-card-note">Token: {testCard.token}</p>
                          <p className="test-card-note">Card Number: {testCard.cardNumber}</p>
                          <p className="test-card-note">Expiry: {testCard.expMonth}/{testCard.expYear} | CVV: {testCard.cvv}</p>
                          <p className="test-card-note">Last 4: {testCard.last4} | Balance: ${testCard.balance} | Status: {testCard.status}</p>
                        </div>
                        <p className="test-card-note">{testCard.note}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          {merchantError && <p className="form-error">Unable to load merchants: {merchantError}</p>}
          {clientValidationError && <p className="form-error">{clientValidationError}</p>}
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