import HTTP from '../http';
import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  picture: string;
}

export const logout = (): Promise<void> => {
  return HTTP.get('/auth/web/logout');
};

export const refreshToken = (
  isCancellable = true,
): Promise<{ access_token: string; refresh_token: string; user: User }> =>
  HTTP.get('/auth/web/token', {
    ...(!isCancellable ? { cancelToken: axios.CancelToken.source().token } : {}),
  }).then(({ data }) => data);

export const getProfile = (): Promise<User> => {
  return HTTP.get('/auth/web/me').then(({ data }) => data);
};
