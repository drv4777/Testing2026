import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { processPayment } from '../../actions/paymentActions';

function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(processPayment(amount, merchantId, paymentMethod));
  };

  return (
    <div>
      <h2>Payment Form</h2>
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input type="text" placeholder="Merchant ID" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
        <input type="text" placeholder="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
        <button type="submit">Pay</button>
      </form>
    </div>
  );
}

export default PaymentForm;