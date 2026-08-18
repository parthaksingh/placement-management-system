const configuredBase = import.meta.env.VITE_API_URL?.trim();
const BASE = (configuredBase || (import.meta.env.DEV ? 'http://localhost:5050/api' : ''))
  .replace(/\/$/, '');
const debugAuth = import.meta.env.VITE_DEBUG_AUTH === 'true';

export async function api(path, options = {}) {
  if (!BASE) {
    throw new Error('The application API URL is not configured. Set VITE_API_URL in Vercel and redeploy.');
  }

  const token = localStorage.getItem('placesmart_token');
  let r;
  try {
    if (debugAuth) console.info('[auth] Request', { url: `${BASE}${path}`, method: options.method || 'GET' });
    r = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('Unable to reach the server. Check VITE_API_URL and the backend CORS settings.');
  }

  if (r.status === 204) return null;
  const contentType = r.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await r.json() : null;
  if (debugAuth) console.info('[auth] Response', { status: r.status, message: data?.message });

  if (!r.ok) {
    const fallback = {
      400: 'Please check the information you entered.',
      401: 'Invalid ID or password.',
      403: 'You do not have permission to access this area.',
      404: 'The requested API route was not found. Check VITE_API_URL.',
      500: 'The server had a problem. Please try again shortly.'
    }[r.status] || `Request failed (HTTP ${r.status}).`;
    throw new Error(data?.message || fallback);
  }

  if (!data) throw new Error('The server returned an unexpected response. Check VITE_API_URL.');
  return data;
}
