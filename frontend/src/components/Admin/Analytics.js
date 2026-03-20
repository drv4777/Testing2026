import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAnalytics } from '../../actions/adminActions';

function Analytics() {
  const dispatch = useDispatch();
  const analytics = useSelector(state => state.admin.analytics);

  useEffect(() => {
    dispatch(getAnalytics());
  }, [dispatch]);

  if (!analytics) return null;

  return (
    <div>
      <h2>Analytics</h2>
      <p>Total Transactions: {analytics.totalTransactions}</p>
      <p>Total Revenue: {analytics.totalRevenue}</p>
      <p>Average Transaction Value: {analytics.averageTransactionValue}</p>
      {/* Add more analytics details */}
    </div>
  );
}

export default Analytics;