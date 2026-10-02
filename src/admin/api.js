/**
 * Client for the Artistry backend (PH-Artistry/backend), used by the admin area.
 *
 * Set VITE_BACKEND_URL to the backend's /api address, for example http://localhost:5000/api.
 * This is separate from VITE_API_BASE_URL, which switches the storefront's mock services.
 */
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
export const backendConfigured = Boolean(BACKEND_URL);

/**
 * Two independent sessions can exist in one browser: the admin area's (team accounts) and the shop's
 * (customer accounts). Each keeps its own token, so signing in to one never signs you out of the other.
 */
const TOKEN_KEYS = { admin: 'ph.admin.token', customer: 'ph.customer.token' };

export const getToken = (session = 'admin') => {
  try {
    return window.localStorage.getItem(TOKEN_KEYS[session]);
  } catch {
    return null;
  }
};
export const setToken = (token, session = 'admin') => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEYS[session], token);
    else window.localStorage.removeItem(TOKEN_KEYS[session]);
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
 * A 401 on an authenticated call signs that session out (the token expired or was revoked).
 * `session` is 'admin' (default) or 'customer'. Extra `headers` are passed through (e.g. Idempotency-Key).
 */
export async function request(path, { method = 'GET', body, query, auth = true, session = 'admin', headers = {} } = {}) {
  const token = auth ? getToken(session) : null;
  let res;
  try {
    res = await fetch(`${BACKEND_URL}${path}${toQuery(query)}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
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
      setToken(null, session);
      window.dispatchEvent(new Event(`${session}:signed-out`));
    }
    const error = (json && json.error) || {};
    const { fields, code, ...details } = error;
    throw new ApiError((json && json.message) || `Request failed (${res.status})`, { status: res.status, fields: fields || {}, code, details });
  }
  return { data: json.data, message: json.message };
}

/** Shorthand that resolves with just the data. */
export const api = async (path, options) => (await request(path, options)).data;

/** The shop's customer session. */
export const shopApi = (path, options = {}) => api(path, { ...options, session: 'customer' });
export const shopRequest = (path, options = {}) => request(path, { ...options, session: 'customer' });

/**
 * Fetch a file the backend serves only to a signed-in user (an invoice) and open or download it.
 * A normal link cannot carry the sign-in token, so the file is fetched and handed to the browser as a blob.
 */
export async function openProtectedFile(path, { session = 'customer', download = null } = {}) {
  const token = getToken(session);
  const res = await fetch(`${BACKEND_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    let message = `Could not open the file (${res.status})`;
    try {
      message = (await res.json()).message || message;
    } catch {
      /* not JSON */
    }
    throw new ApiError(message, { status: res.status });
  }
  const url = URL.createObjectURL(await res.blob());
  const link = document.createElement('a');
  link.href = url;
  if (download) link.download = download;
  else link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
