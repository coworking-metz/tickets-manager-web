import HTTP from '../http';
import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export const login = (): Promise<string> => {
  return HTTP.get('auth/login');
};

export const logout = (): Promise<void> => {
  return HTTP.get('auth/logout');
};

export const refreshToken = (
  isCancellable = true,
): Promise<{ access_token: string; refresh_token: string }> =>
  HTTP.get('auth/token', {
    ...(!isCancellable ? { cancelToken: axios.CancelToken.source().token } : {}),
  }).then(({ data }) => data);

export const getProfile = (): Promise<User> => {
  return HTTP.get('auth/me').then(({ data }) => data);
};
