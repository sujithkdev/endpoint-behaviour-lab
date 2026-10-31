import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from '../apps/api/server.mjs';
import { createDemoRepository } from '../packages/adapters/demo-repository.mjs';

async function withServer(run) {
  const server = createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}
test('dashboard agrees with asset and finding endpoints', () => withServer(async base => {
  const [a, v, d] = await Promise.all(['assets', 'vulnerabilities', 'dashboard'].map(async path => (await (await fetch(`${base}/api/v1/${path}`)).json()).data));
  assert.equal(d.assets, a.length); assert.equal(d.vulnerabilities, v.length);
  assert.equal(d.affectedAssets, new Set(v.map(row => row.assetId)).size);
  assert.equal(Object.values(d.bySeverity).reduce((x,y)=>x+y,0), v.length);
}));
test('unimplemented modules cannot masquerade as functioning features', () => withServer(async base => {
  const response = await fetch(`${base}/api/v1/patches`);
  assert.equal(response.status, 501); assert.equal((await response.json()).error.code, 'NOT_IMPLEMENTED');
  const capabilities = await (await fetch(`${base}/api/v1/capabilities`)).json();
  assert.equal(capabilities.agentExecution, false); assert.equal(capabilities.database, false);
}));
test('writes are rejected and unknown paths do not leak filesystem content', () => withServer(async base => {
  assert.equal((await fetch(`${base}/api/v1/assets`, {method:'POST',body:'{}'})).status, 405);
  for (const path of ['/package.json','/..%2fpackage.json','/api/v1/unknown']) assert.equal((await fetch(base+path)).status,404);
}));
test('static UI is served with a restrictive content policy', () => withServer(async base => {
  const response=await fetch(base); assert.equal(response.status,200);
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(await response.text(), /Synthetic data/);
}));
test('consumers cannot mutate shared fixture state', () => {
  const repository=createDemoRepository(); repository.assets()[0].hostname='modified';
  assert.equal(repository.assets()[0].hostname,'lab-workstation');
});
