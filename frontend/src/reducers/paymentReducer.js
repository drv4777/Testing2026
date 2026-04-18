import { PROCESS_PAYMENT_REQUEST, PROCESS_PAYMENT_SUCCESS, PROCESS_PAYMENT_FAILURE, GET_TRANSACTION_HISTORY_SUCCESS, GET_TRANSACTION_HISTORY_FAILURE } from '../actions/paymentActions';

const initialState = {
  transaction: null,
  history: [],
  processing: false,
  error: null,
};

function paymentReducer(state = initialState, action) {
  switch (action.type) {
    case PROCESS_PAYMENT_REQUEST:
      return {
        ...state,
        processing: true,
        error: null,
      };
    case PROCESS_PAYMENT_SUCCESS:
      return {
        ...state,
        transaction: action.payload,
        processing: false,
        error: null,
      };
    case PROCESS_PAYMENT_FAILURE:
    case GET_TRANSACTION_HISTORY_FAILURE:
      return {
        ...state,
        transaction: null,
        processing: false,
        error: action.payload,
      };
    case GET_TRANSACTION_HISTORY_SUCCESS:
      return {
        ...state,
        history: action.payload,
        error: null,
      };
    default:
      return state;
  }
}

export default paymentReducer;