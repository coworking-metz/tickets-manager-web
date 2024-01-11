import HTTP from '../http';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: ('admin' | 'coworker' | 'guest' | 'external')[];
  picture: string;
}

export const refreshTokens = (
  refreshToken: string | null,
  isCancellable = true,
): Promise<{ accessToken: string; refreshToken: string }> => {
  return HTTP.post(
    '/auth/tokens',
    { refreshToken: refreshToken },
    {
      ...(!isCancellable ? { cancelToken: axios.CancelToken.source().token } : {}),
    },
  ).then(({ data }) => data);
};
