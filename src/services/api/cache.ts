import { HTTP } from '../http';

export const clearCache = (): Promise<void> => {
  return HTTP.post('/api/cache/clear').then(({ data }) => data);
};
