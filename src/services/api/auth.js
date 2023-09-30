import HTTP from '../http.js';
import axios from 'axios';

export const logout = () => {
  return HTTP.get('/auth/web/logout');
};

export const refreshToken = (isCancellable = true) =>
  HTTP.get('/auth/web/token', {
    ...(!isCancellable ? { cancelToken: axios.CancelToken.source().token } : {}),
  }).then(({ data }) => data);

export const getProfile = () => {
  return HTTP.get('/auth/web/me').then(({ data }) => data);
};
