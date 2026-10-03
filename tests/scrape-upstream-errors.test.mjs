import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRoute } from './helpers/route-loader.mjs';
const { POST } = loadRoute('app/api/scrape/route.ts', { 'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } } });

async function post(upstream) {
  const original = globalThis.fetch;
  globalThis.fetch = async () => upstream;
  try {
    const res = await POST(new Request('http://local/api/scrape', { method: 'POST', body: JSON.stringify({ category: 'plumber', location: 'London' }) }));
    return { status: res.status, body: await res.json() };
  } finally { globalThis.fetch = original; }
}

test('scraper failure detail is returned as error so the page can show it', async () => {
  const { status, body } = await post(Response.json({ detail: 'Page.goto: Timeout 60000ms exceeded.' }, { status: 500 }));
  assert.equal(status, 500);
  assert.equal(body.error, 'Page.goto: Timeout 60000ms exceeded.');
});

test('scraper validation errors become a readable error string', async () => {
  const { status, body } = await post(Response.json({ detail: [{ loc: ['body', 'total'], msg: 'bad' }] }, { status: 422 }));
  assert.equal(status, 422);
  assert.equal(typeof body.error, 'string');
});

test('non-JSON scraper responses return 502 instead of throwing', async () => {
  const { status, body } = await post(new Response('<html>Bad gateway</html>', { status: 502 }));
  assert.equal(status, 502);
  assert.equal(typeof body.error, 'string');
});

test('successful responses are passed through unchanged', async () => {
  const { status, body } = await post(Response.json({ data: [], count: 0, search: 'plumber in London' }, { status: 200 }));
  assert.equal(status, 200);
  assert.deepEqual(body, { data: [], count: 0, search: 'plumber in London' });
});
