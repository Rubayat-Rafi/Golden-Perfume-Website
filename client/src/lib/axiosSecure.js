import axios from 'axios';
import { getToken, setToken, clearToken } from './api';

const BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : '/api';

const axiosSecure = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request
axiosSecure.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: try silent refresh once, then retry the original request
let refreshPromise = null;

axiosSecure.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    // Deduplicate concurrent refresh calls
    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
        .then((r) => { setToken(r.data.accessToken); })
        .catch(() => { clearToken(); })
        .finally(() => { refreshPromise = null; });
    }
    await refreshPromise;

    const newToken = getToken();
    if (!newToken) return Promise.reject(err);

    original.headers.Authorization = `Bearer ${newToken}`;
    return axiosSecure(original);
  }
);

export default axiosSecure;
