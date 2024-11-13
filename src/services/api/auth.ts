import { version as appVersion } from '../../../package.json';
import axios from 'axios';

export enum UserCapabilities {
  UNLOCK_GATE = 'UNLOCK_GATE',
  PARKING_ACCESS = 'PARKING_ACCESS',
  UNLOCK_DECK_DOOR = 'UNLOCK_DECK_DOOR',
  KEYS_ACCESS = 'KEYS_ACCESS',
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: ('admin' | 'coworker' | 'guest' | 'external')[];
  picture: string;
  wpUserId?: number;
  iat: number;
  exp: number;
  capabilities: UserCapabilities[];
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

// https://stackoverflow.com/a/38552302
export const decodeToken = (token: string): User => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
};
