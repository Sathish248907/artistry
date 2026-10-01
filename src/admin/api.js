/**
 * Client for the Artistry backend (PH-Artistry/backend), used by the admin area.
 *
 * Set VITE_BACKEND_URL to the backend's /api address, for example http://localhost:5000/api.
 * This is separate from VITE_API_BASE_URL, which switches the storefront's mock services.
 */
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
export const backendConfigured = Boolean(BACKEND_URL);

const TOKEN_KEY = 'ph.admin.token';

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: the session lasts until the tab closes */
  }
};

/** An error answered by the backend (or a failure to reach it). `fields` holds per-field validation messages. */
export class ApiError extends Error {
  constructor(message, { status = 0, fields = {}, code, details = {} } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
    this.code = code;
    this.details = details;
  }
}

const toQuery = (query) => {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value);
  });
  const text = params.toString();
  return text ? `?${text}` : '';
};

/**
 * Call the backend. Resolves with { data, message }; rejects with ApiError.
 * A 401 on an authenticated call signs the admin out (the token expired or was revoked).
 */
export async function request(path, { method = 'GET', body, query, auth = true } = {}) {
  const token = auth ? getToken() : null;
  let res;
  try {
    res = await fetch(`${BACKEND_URL}${path}${toQuery(query)}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`Cannot reach the backend at ${BACKEND_URL}. Check that it is running.`, { status: 0, code: 'NETWORK' });
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* not JSON */
  }

  if (!res.ok || !json || json.success === false) {
    if (res.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event('admin:signed-out'));
    }
    const error = (json && json.error) || {};
    const { fields, code, ...details } = error;
    throw new ApiError((json && json.message) || `Request failed (${res.status})`, { status: res.status, fields: fields || {}, code, details });
  }
  return { data: json.data, message: json.message };
}

/** Shorthand that resolves with just the data. */
export const api = async (path, options) => (await request(path, options)).data;
