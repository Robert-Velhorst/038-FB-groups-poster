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
      const response = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId.replace('/', '~'))}/runs?waitForFinish=60`, {
        method: 'POST', headers: { authorization: `Bearer ${process.env.APIFY_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(70_000),
      });
      const raw = await response.text();
      if (!response.ok) return json(res, response.status, { error: `Apify returned ${response.status}: ${raw.slice(0, 700)}` });
      let payload;
      try { payload = JSON.parse(raw); } catch { return json(res, 502, { error: 'Apify response was not valid JSON.' }); }
      const run = payload.data;
      if (!run?.id) return json(res, 502, { error: 'Apify started without returning a run ID.' });
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) return finishRun(res, run);
      return json(res, 202, { runId: run.id, status: run.status, datasetId: run.defaultDatasetId || null });
    } catch (error) { return json(res, 502, { error: error.name === 'TimeoutError' ? 'Apify did not respond within 70 seconds. Check the run in Apify and try a smaller collection.' : `Could not reach Apify: ${error.message}` }); }
  }
  const runMatch = pathname.match(/^\/api\/apify\/runs\/([A-Za-z0-9_-]+)$/);
  if (req.method === 'GET' && runMatch) {
    if (!process.env.APIFY_TOKEN) return json(res, 503, { error: 'Apify is not connected.' });
    try {
      const response = await fetch(`https://api.apify.com/v2/actor-runs/${encodeURIComponent(runMatch[1])}?waitForFinish=60`, { headers: { authorization: `Bearer ${process.env.APIFY_TOKEN}` }, signal: AbortSignal.timeout(65_000) });
      const raw = await response.text();
      if (!response.ok) return json(res, response.status, { error: `Apify returned ${response.status}: ${raw.slice(0, 700)}` });
      const payload = JSON.parse(raw);
      const run = payload.data;
      if (!run?.id) return json(res, 502, { error: 'Apify run response was incomplete.' });
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) return finishRun(res, run);
      return json(res, 202, { runId: run.id, status: run.status, datasetId: run.defaultDatasetId || null });
    } catch (error) { return json(res, 502, { error: error.name === 'TimeoutError' ? 'Waiting for the Apify run timed out. Check its status in Apify.' : `Could not retrieve the Apify run: ${error.message}` }); }
  }
  return json(res, 404, { error: 'API route not found.' });
}

async function finishRun(res, run) {
  if (run.status !== 'SUCCEEDED') return json(res, 502, { error: `Apify run ended with status ${run.status}. Open the run in Apify for details.`, runId: run.id, status: run.status });
  if (!run.defaultDatasetId) return json(res, 200, { items: [], count: 0, runId: run.id, status: run.status });
  try {
    const response = await fetch(`https://api.apify.com/v2/datasets/${encodeURIComponent(run.defaultDatasetId)}/items?clean=true&format=json&limit=100`, { headers: { authorization: `Bearer ${process.env.APIFY_TOKEN}` }, signal: AbortSignal.timeout(30_000) });
    const raw = await response.text();
    if (!response.ok) return json(res, response.status, { error: `Could not read the Apify dataset (${response.status}): ${raw.slice(0, 700)}` });
    const items = JSON.parse(raw);
    return json(res, 200, { items: Array.isArray(items) ? items : [], count: Array.isArray(items) ? items.length : 0, runId: run.id, status: run.status });
  } catch (error) { return json(res, 502, { error: `Could not read Apify results: ${error.message}` }); }
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
    res.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', 'x-frame-options': 'DENY', 'permissions-policy': 'camera=(), microphone=(), geolocation=()', 'content-security-policy': "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.apify.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" });
    if (req.method === 'HEAD') return res.end();
    res.end(content);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Common Ground listening on http://127.0.0.1:${port}`));

