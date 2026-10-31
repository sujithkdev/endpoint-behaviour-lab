import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { catalog } from '../../packages/domain/catalog.mjs';
import { createDemoRepository } from '../../packages/adapters/demo-repository.mjs';
import { dashboard } from '../../packages/domain/dashboard.mjs';

const web = new URL('../web/', import.meta.url);
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
]);

export function createServer(repository = createDemoRepository()) {
  return http.createServer(async (req, res) => {
    const requestId = randomUUID();
    const json = (status, value) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Request-Id': requestId });
      res.end(JSON.stringify(value));
    };
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      const fail = (status, code, message) => json(status, { error: { code, message, requestId } });
      if (req.method !== 'GET') return fail(405, 'READ_ONLY_SKELETON', 'This development skeleton exposes read-only demonstration endpoints.');
      if (path === '/health/live') return json(200, { status: 'ok', mode: 'demo', persistence: 'none', productionReady: false });
      if (path === '/api/v1/modules') return json(200, { data: catalog, mode: 'demo' });
      if (path === '/api/v1/assets') return json(200, { data: repository.assets(), mode: 'demo' });
      if (path === '/api/v1/vulnerabilities') return json(200, { data: repository.vulnerabilities(), mode: 'demo' });
      if (path === '/api/v1/dashboard') return json(200, { data: dashboard(repository), mode: 'demo' });
      if (path === '/api/v1/capabilities') return json(200, { mode: 'demo', authentication: false, database: false, agentExecution: false, modules: catalog });
      if (path.startsWith('/api/v1/')) {
        const moduleId = path.slice('/api/v1/'.length).split('/')[0];
        if (catalog.some(m => m.id === moduleId)) return fail(501, 'NOT_IMPLEMENTED', `${moduleId} has a design boundary but no implementation yet.`);
        return fail(404, 'NOT_FOUND', 'Unknown API route.');
      }
      const entry = staticFiles.get(path);
      if (!entry) return fail(404, 'NOT_FOUND', 'Unknown route.');
      const bytes = await readFile(new URL(entry[0], web));
      res.writeHead(200, { 'Content-Type': entry[1], 'Cache-Control': 'no-store' });
      res.end(bytes);
    } catch (error) {
      console.error(JSON.stringify({ requestId, error: error.message }));
      if (!res.headersSent) json(500, { error: { code: 'INTERNAL_ERROR', message: 'Request failed.', requestId } });
      else res.end();
    }
  });
}
