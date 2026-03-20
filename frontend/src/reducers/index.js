import { combineReducers } from 'redux';
import authReducer from './authReducer';
import paymentReducer from './paymentReducer';
import adminReducer from './adminReducer';

export default combineReducers({
  auth: authReducer,
  payment: paymentReducer,
  admin: adminReducer,
});