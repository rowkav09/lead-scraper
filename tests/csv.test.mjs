import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRoute } from './helpers/route-loader.mjs';
const { leadsToCsv } = loadRoute('lib/csv.ts');
const lead = (o) => ({ name: 'A', address: '', ...o });
test('quotes, commas and newlines survive', () => {
  const out = leadsToCsv([lead({ name: 'He said "hi", ok\nbye' })]);
  assert.equal(out.split('\r\n')[1], '"He said ""hi"", ok\nbye",""');
});
test('cells starting with a formula character are not run as formulas in a spreadsheet', () => {
  for (const v of ['=HYPERLINK("http://x")', '+cmd|x', '-2+3', '@SUM(A1)']) {
    const row = leadsToCsv([lead({ name: v })]).split('\r\n')[1];
    assert.ok(row.startsWith(`"'${v.replace(/"/g, '""')}"`), row);
  }
});
test('output starts with a UTF-8 BOM so Excel reads accents correctly', () => {
  assert.equal(leadsToCsv([lead({})]).charCodeAt(0), 0xfeff);
});
test('phone numbers keep their leading + and are not altered', () => {
  const row = leadsToCsv([lead({ name: '+44 20 7946 0958' })]).split('\r\n')[1];
  assert.ok(row.startsWith('"+44 20 7946 0958"'), row);
});
