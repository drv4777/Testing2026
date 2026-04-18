import { api } from '../utils/api';

export const PROCESS_PAYMENT_REQUEST = 'PROCESS_PAYMENT_REQUEST';
export const PROCESS_PAYMENT_SUCCESS = 'PROCESS_PAYMENT_SUCCESS';
export const PROCESS_PAYMENT_FAILURE = 'PROCESS_PAYMENT_FAILURE';
export const GET_TRANSACTION_HISTORY_SUCCESS = 'GET_TRANSACTION_HISTORY_SUCCESS';
export const GET_TRANSACTION_HISTORY_FAILURE = 'GET_TRANSACTION_HISTORY_FAILURE';

export const processPayment = (
  amount,
  merchantId,
  paymentMethod,
  currency = 'USD',
  cardToken = '',
  cardNumber = '',
  expMonth = '',
  expYear = '',
  cvv = ''
) => async (dispatch) => {
  try {
    dispatch({ type: PROCESS_PAYMENT_REQUEST });
    const response = await api.post('/payment/process', {
      amount,
      merchantId,
      paymentMethod,
      currency,
      cardToken,
      cardNumber,
      expMonth,
      expYear,
      cvv,
    });
    dispatch({
      type: PROCESS_PAYMENT_SUCCESS,
      payload: response.data.transaction,
    });
  } catch (error) {
    dispatch({
      type: PROCESS_PAYMENT_FAILURE,
      payload: error.response?.data?.message || 'Payment failed',
    });
  }
};

export const getTransactionHistory = () => async (dispatch) => {
  try {
    const response = await api.get('/payment/history');
    dispatch({
      type: GET_TRANSACTION_HISTORY_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_TRANSACTION_HISTORY_FAILURE,
      payload: error.response?.data?.message || 'Failed to get transaction history',
    });
  }
};