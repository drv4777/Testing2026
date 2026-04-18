import React from 'react';
import { useSelector } from 'react-redux';

function TransactionStatus() {
  const transaction = useSelector((state) => state.payment.transaction);

  if (!transaction) return null;

  return (
    <div className="transaction-status-card">
      <h2>Transaction Status</h2>
      <p><strong>Status:</strong> {transaction.status}</p>
      <p><strong>Amount:</strong> {transaction.currency || 'USD'} {transaction.amount}</p>
      {transaction.paymentMethod && <p><strong>Method:</strong> {transaction.paymentMethod}</p>}
      {transaction.gatewayReference && <p><strong>Gateway Ref:</strong> {transaction.gatewayReference}</p>}
    </div>
  );
}

export default TransactionStatus;