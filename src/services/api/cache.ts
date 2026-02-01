import { HTTP } from '../http';
import axios from 'axios';

export const clearCache = (): Promise<void> => {
  return HTTP.post('/api/cache/clear', { cancelToken: axios.CancelToken.source().token }).then(
    ({ data }) => data,
  );
};
