import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMerchants } from '../../actions/adminActions';

function MerchantManagement() {
  const dispatch = useDispatch();
  const merchants = useSelector(state => state.admin.merchants);

  useEffect(() => {
    dispatch(getMerchants());
  }, [dispatch]);

  return (
    <div>
      <h2>Merchant Management</h2>
      <ul>
        {merchants.map(merchant => (
          <li key={merchant._id}>
            Name: {merchant.name}, API Key: {merchant.apiKey}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MerchantManagement;