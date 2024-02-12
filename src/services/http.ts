import { version as appVersion } from '../../package.json';
import axios from 'axios';

const HTTP = axios.create({
  baseURL: import.meta.env.VUE_APP_API_URL,
  timeout: 10_000,
  headers: {
    'X-APP-NAME': 'MANAGER',
    'X-APP-VERSION': appVersion,
  },
});

export default HTTP;
