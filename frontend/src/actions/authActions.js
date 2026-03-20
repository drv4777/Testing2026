import axios from 'axios';
import { api } from '../utils/api';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

export const login = (username, password, history) => async (dispatch) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    dispatch({
      type: LOGIN_SUCCESS,
      payload: response.data,
    });
    history.push('/payment');
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response?.data?.message || 'Login failed',
    });
  }
};

export const register = (username, password, history) => async (dispatch) => {
  try {
    await api.post('/auth/register', { username, password });
    dispatch({ type: REGISTER_SUCCESS });
    history.push('/login');
  } catch (error) {
    dispatch({
      type: REGISTER_FAILURE,
      payload: error.response?.data?.message || 'Registration failed',
    });
  }
};

export const logout = (history) => (dispatch) => {
  dispatch({ type: LOGOUT_SUCCESS });
  history.push('/login');
};