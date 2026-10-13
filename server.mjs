import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
try {
  const envText = await readFile(resolve(root, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* .env is optional */ }
const port = Number(process.env.PORT || 4179);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon' };
const json = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)); };

async function readBody(req) {
  let raw = '';
  for await (const part of req) { raw += part; if (raw.length > 1_000_000) throw new Error('Request body is too large.'); }
  return JSON.parse(raw || '{}');
}

async function handleApi(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/health') return json(res, 200, { ok: true, apifyConfigured: Boolean(process.env.APIFY_TOKEN) });
  if (req.method === 'POST' && pathname === '/api/apify/run') {
    if (!process.env.APIFY_TOKEN) return json(res, 503, { error: 'Apify is not connected yet. Add APIFY_TOKEN to the server .env file and restart the server.' });
    let body;
    try { body = await readBody(req); } catch (error) { return json(res, 400, { error: error.message || 'Invalid JSON request.' }); }
    const actorId = String(body.actorId || '');
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(actorId)) return json(res, 400, { error: 'Enter an Apify Actor ID in username/actor-name format.' });
    const input = body.input && typeof body.input === 'object' ? body.input : {};
    try {
      const response = await fetch(`https://api.apify.com/v2/acts/${actorId.split('/').map(encodeURIComponent).join('~')}/run-sync-get-dataset-items?clean=true&format=json&limit=100`, {
        method: 'POST', headers: { authorization: `Bearer ${process.env.APIFY_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(120_000),
      });
      const raw = await response.text();
      if (!response.ok) return json(res, response.status, { error: `Apify returned ${response.status}: ${raw.slice(0, 700)}` });
      let items;
      try { items = JSON.parse(raw); } catch { return json(res, 502, { error: 'Apify response was not valid JSON.' }); }
      return json(res, 200, { items: Array.isArray(items) ? items : [], count: Array.isArray(items) ? items.length : 0 });
    } catch (error) { return json(res, 502, { error: error.name === 'TimeoutError' ? 'Apify run timed out. Try a smaller collection.' : `Could not reach Apify: ${error.message}` }); }
  }
  return json(res, 404, { error: 'API route not found.' });
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url.pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed.' });
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end('Bad URL'); return; }
  let target = resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403).end('Forbidden'); return; }
  try { if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html'); }
  catch { target = resolve(root, 'index.html'); }
  try {
    const content = await readFile(target);
    res.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    res.end(content);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Common Ground listening on http://127.0.0.1:${port}`));
