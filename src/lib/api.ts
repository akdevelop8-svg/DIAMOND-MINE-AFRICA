const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  reason?: string;
  constructor(message: string, status = 500, reason?: string) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers,
    credentials: options.credentials ?? 'include',
  });
  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const looksLikeHtml = /^\s*<!doctype html|^\s*<html/i.test(text);
    const message = response.status === 404
      ? 'The API endpoint was not found. Check the Vercel API routing and redeploy the latest project files.'
      : looksLikeHtml
        ? `The server returned an unexpected page (HTTP ${response.status}). Check Vercel runtime logs.`
        : text || 'Server returned an invalid response.';
    data = { error: message };
  }
  if (!response.ok) throw new ApiError(data.error || 'Request failed.', response.status, data.reason);
  return data as T;
}

// Kept for source compatibility with older components. Authentication now uses HttpOnly cookies.
export const setToken = (_token: string | null) => undefined;
