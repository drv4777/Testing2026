import { api } from '../utils/api';

export const GET_MERCHANTS_SUCCESS = 'GET_MERCHANTS_SUCCESS';
export const GET_MERCHANTS_FAILURE = 'GET_MERCHANTS_FAILURE';
export const GET_ANALYTICS_SUCCESS = 'GET_ANALYTICS_SUCCESS';
export const GET_ANALYTICS_FAILURE = 'GET_ANALYTICS_FAILURE';

export const getMerchants = () => async (dispatch) => {
  try {
    const response = await api.get('/admin/merchant');
    dispatch({
      type: GET_MERCHANTS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_MERCHANTS_FAILURE,
      payload: error.response?.data?.message || 'Failed to get merchants',
    });
  }
};

export const getAnalytics = () => async (dispatch) => {
  try {
    const response = await api.get('/admin/analytics');
    dispatch({
      type: GET_ANALYTICS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_ANALYTICS_FAILURE,
      payload: error.response?.data?.message || 'Failed to get analytics',
    });
  }
};