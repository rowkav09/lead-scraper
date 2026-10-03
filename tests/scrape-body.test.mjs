import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRoute } from './helpers/route-loader.mjs';
const { POST } = loadRoute('app/api/scrape/route.ts', { 'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } } });
test('empty/malformed JSON and non-object bodies are client errors without upstream requests', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('must not fetch'); };
  try {
    for (const body of ['', 'not json', 'null', '[]', '42']) {
      const response = await POST(new Request('http://local/api/scrape', { method: 'POST', body }));
      assert.equal(response.status, 400, body);
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = original; }
});
test('valid body still forwards to scraper and preserves its status', async () => {
  const original = globalThis.fetch;
  let sent;
  globalThis.fetch = async (_url, options) => { sent = JSON.parse(options.body); return Response.json({ places: [] }, { status: 201 }); };
  try {
    const response = await POST(new Request('http://local/api/scrape', { method: 'POST', body: JSON.stringify({ category: 'plumber', location: 'London' }) }));
    assert.equal(response.status, 201);
    assert.deepEqual(sent, { category: 'plumber', location: 'London', total: 10 });
  } finally { globalThis.fetch = original; }
});
test('non-string or blank category/location and bad totals are 400s without an upstream request', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({}); };
  try {
    const bad = [
      { category: 5, location: 'London' },
      { category: {}, location: 'London' },
      { category: '  ', location: 'London' },
      { category: 'plumber', location: ['London'] },
      { category: 'plumber', location: 'London', total: 'ten' },
      { category: 'plumber', location: 'London', total: 2.5 },
    ];
    for (const b of bad) {
      const response = await POST(new Request('http://local/api/scrape', { method: 'POST', body: JSON.stringify(b) }));
      assert.equal(response.status, 400, JSON.stringify(b));
      assert.equal(typeof (await response.json()).error, 'string');
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = original; }
});
