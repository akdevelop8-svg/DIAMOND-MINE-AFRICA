import app from '../server.js';

/**
 * Vercel sends every /api/* request through this single function. The rewrite stores the
 * requested API path in the `path` query parameter; restore it before passing the request
 * to Express so the same routes work locally and in production.
 */
export default function handler(req, res) {
  try {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `https://${host}`);
    const requestedPath = url.searchParams.get('path');

    if (requestedPath !== null) {
      const normalizedPath = requestedPath.replace(/^\/+|\/+$/g, '');
      const segments = normalizedPath.split('/');
      if (
        !normalizedPath ||
        !/^[a-zA-Z0-9/_-]+$/.test(normalizedPath) ||
        segments.some((segment) => !segment || segment === '.' || segment === '..')
      ) {
        return res.status(400).json({ error: 'Invalid API route.' });
      }

      url.searchParams.delete('path');
      const query = url.searchParams.toString();
      req.url = `/api/${normalizedPath}${query ? `?${query}` : ''}`;
    } else if (url.pathname === '/api/index') {
      return res.status(404).json({ error: 'API route was not specified.' });
    }

    return app(req, res);
  } catch (error) {
    console.error('API request dispatch failed:', error);
    return res.status(400).json({ error: 'Invalid API request.' });
  }
}
