import { GET_MERCHANTS_REQUEST, GET_MERCHANTS_SUCCESS, GET_MERCHANTS_FAILURE, GET_ANALYTICS_SUCCESS, GET_ANALYTICS_FAILURE } from '../actions/adminActions';

const initialState = {
  merchants: [],
  merchantsLoading: false,
  analytics: null,
  error: null,
};

function adminReducer(state = initialState, action) {
  switch (action.type) {
    case GET_MERCHANTS_REQUEST:
      return {
        ...state,
        merchantsLoading: true,
        error: null,
      };
    case GET_MERCHANTS_SUCCESS:
      return {
        ...state,
        merchants: action.payload,
        merchantsLoading: false,
        error: null,
      };
    case GET_MERCHANTS_FAILURE:
      return {
        ...state,
        merchants: [],
        merchantsLoading: false,
        error: action.payload,
      };
    case GET_ANALYTICS_SUCCESS:
      return {
        ...state,
        analytics: action.payload,
        error: null,
      };
    case GET_ANALYTICS_FAILURE:
      return {
        ...state,
        analytics: null,
        error: action.payload,
      };
    default:
      return state;
  }
}

export default adminReducer;