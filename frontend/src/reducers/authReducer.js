import { LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS, REGISTER_SUCCESS, REGISTER_FAILURE } from '../actions/authActions';

const initialState = {
  isAuthenticated: localStorage.getItem('token') ? true : false,
  token: localStorage.getItem('token'),
  error: null,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        error: null,
      };
    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        error: action.payload,
      };
    case LOGOUT_SUCCESS:
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        error: null,
      };
    case REGISTER_SUCCESS:
        return {
          ...state,
          error: null,
        };
    default:
      return state;
  }
}

export default authReducer;