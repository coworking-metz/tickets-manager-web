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
  return HTTP.get('/auth/logout');
};

export const refreshTokens = (
  refreshToken: string | null,
  isCancellable = true,
): Promise<{ accessToken: string; refreshToken: string }> => {
  return HTTP.post(
    '/auth/tokens',
    { refresh_token: refreshToken },
    {
      ...(!isCancellable ? { cancelToken: axios.CancelToken.source().token } : {}),
    },
  ).then(({ data }) => data);
};

export const getProfile = (): Promise<User> => {
  return HTTP.get('/auth/me').then(({ data }) => data);
};
