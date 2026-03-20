import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionHistory } from '../../actions/paymentActions';

function TransactionHistory() {
  const dispatch = useDispatch();
  const transactions = useSelector(state => state.payment.history);

  useEffect(() => {
    dispatch(getTransactionHistory());
  }, [dispatch]);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction._id}>
            Amount: {transaction.amount}, Status: {transaction.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionHistory;