// Access token lives in memory — never in localStorage (XSS-safe)
// Refresh token lives in httpOnly cookie (set by server, sent automatically)

let _accessToken = null;

export const setToken  = (t) => { _accessToken = t; };
export const clearToken = ()  => { _accessToken = null; };
export const getToken  = ()   => _accessToken;

// ✅ Works in both local (via proxy) and production (direct URL)
const BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : '/api';

// ─── Core fetch ────────────────────────────────────────────────────────────

const request = async (path, opts = {}) => {
  const isForm = opts.body instanceof FormData;
  const headers = {
    // For FormData, let the browser set Content-Type (with multipart boundary)
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
    ...opts.headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',   // send httpOnly refresh cookie on every request
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
};

// ─── Silent-refresh wrapper ─────────────────────────────────────────────────
// On 401: try to refresh the access token then retry the original request once.

const withRefresh = async (path, opts = {}) => {
  try {
    return await request(path, opts);
  } catch (err) {
    if (err.status !== 401) throw err;

    // Attempt token refresh (uses httpOnly cookie — no body needed)
    try {
      const refreshed = await request('/auth/refresh', { method: 'POST' });
      setToken(refreshed.accessToken);
    } catch {
      clearToken();
      throw err;   // refresh failed — propagate original 401
    }

    // Retry with new token
    return request(path, opts);
  }
};

// ─── Public API ────────────────────────────────────────────────────────────

export const api = {
  get:    (path)       => withRefresh(path, { method: 'GET' }),
  post:   (path, body) => withRefresh(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    (path, body) => withRefresh(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (path, body) => withRefresh(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del:    (path)       => withRefresh(path, { method: 'DELETE' }),

  // Multipart upload (FormData) — Content-Type set automatically by the browser
  upload: (path, formData, method = 'POST') => withRefresh(path, { method, body: formData }),

  // Auth routes — no refresh retry (avoids infinite loops on auth endpoints)
  auth:   (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
};
