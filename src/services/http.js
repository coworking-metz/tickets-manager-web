import axios from 'axios';

const HTTP = axios.create({
  baseURL: import.meta.env.VUE_APP_API_URL,
  withCredentials: true,
  timeout: 30000,
});

export default HTTP;
