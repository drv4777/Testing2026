import React from 'react';
import { useSelector } from 'react-redux';

function TransactionStatus() {
  const transaction = useSelector(state => state.payment.transaction);

  if (!transaction) return null;

  return (
    <div>
      <h2>Transaction Status</h2>
      <p>Status: {transaction.status}</p>
      <p>Amount: {transaction.amount}</p>
      {/* Add more transaction details */}
    </div>
  );
}

export default TransactionStatus;