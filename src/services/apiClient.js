// Thin client: today every call resolves from mock JSON; set VITE_API_BASE_URL to route through a real backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const LATENCY = 260;

const wait = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

export async function mock(data, { fail = false, ms } = {}) {
  await wait(ms);
  if (fail) throw new Error('Request failed');
  return clone(data);
}

export async function http(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.json();
}

export const useRemote = Boolean(BASE_URL);
