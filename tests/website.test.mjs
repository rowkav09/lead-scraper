import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRoute } from './helpers/route-loader.mjs';
const { websiteHref, formatWebsite } = loadRoute('lib/website.ts');
test('websiteHref keeps real URLs and adds https to bare domains', () => {
  assert.equal(websiteHref('https://a.com/x'), 'https://a.com/x');
  assert.equal(websiteHref('HTTP://a.com'), 'HTTP://a.com');
  assert.equal(websiteHref('a.com'), 'https://a.com');
});
test('a bare domain that starts with "http" still gets a scheme', () => {
  assert.equal(websiteHref('httpbin.org'), 'https://httpbin.org');
  assert.equal(websiteHref('https-plumbing.co.uk'), 'https://https-plumbing.co.uk');
});
test('formatWebsite shows the host only', () => {
  assert.equal(formatWebsite('https://www.a.com/x?y=1'), 'a.com');
});
