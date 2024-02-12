import { version as appVersion } from '../../../package.json';
import axios from 'axios';
export interface User {
  id: string;
  name: string;
  email: string;
  roles: ('admin' | 'coworker' | 'guest' | 'external')[];
  picture: string;
  wpUserId?: number;
}

export const refreshTokens = (
  refreshToken: string | null,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // refreshing tokens should have its own axios config
  // and should not be cancelled
  return axios
    .post(
      '/api/auth/tokens',
      { refreshToken: refreshToken },
      {
        baseURL: import.meta.env.VUE_APP_API_URL,
        timeout: 10_000,
        headers: {
          ...(appVersion ? { 'X-APP-VERSION': appVersion } : {}),
        },
      },
    )
    .then(({ data }) => data);
};
