import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { loadRoute } from './helpers/route-loader.mjs';
const require = createRequire(import.meta.url);
const ts = require('typescript');

function mountPage() {
  const state = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
    useEffect() {},
  };
  const jsx = (type, props) => ({ type, props });
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('src/app/page.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const localRequire = id => {
    if (id === 'react') return react;
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (id.startsWith('../lib/')) return loadRoute(id.slice(3) + '.ts');
    return require(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(localRequire, module, module.exports);
  return () => { cursor = 0; return module.exports.default(); };
}

function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (predicate(tree)) return tree;
  const children = [tree.props?.children].flat(Infinity);
  for (const child of children) {
    const match = find(child, predicate);
    if (match) return match;
  }
}

function setSearch(render, category, location) {
  find(render(), n => n.type === 'input' && n.props.placeholder.includes('Plumber')).props.onChange({ target: { value: category } });
  find(render(), n => n.type === 'input' && n.props.placeholder.includes('New York')).props.onChange({ target: { value: location } });
}

test('CSV filenames keep the completed query when the form is edited', async () => {
  const render = mountPage();
  const oldFetch = globalThis.fetch;
  const oldDocument = globalThis.document;
  const oldTimeout = globalThis.setTimeout;
  let filename;
  globalThis.fetch = async () => Response.json({ data: [{ name: 'London Plumbing' }], search: 'Plumber in London' });
  globalThis.document = { createElement: () => ({ set download(value) { filename = value; }, click() {} }) };
  globalThis.setTimeout = () => 0;
  try {
    setSearch(render, 'Plumber', 'London');
    await find(render(), n => n.type === 'form').props.onSubmit({ preventDefault() {} });
    setSearch(render, 'Dentist', 'Oxford');
    find(render(), n => n.type === 'button' && Array.isArray(n.props.children) && n.props.children.includes('Download all as CSV')).props.onClick();
    assert.match(filename, /^leads_Plumber_London_\d{4}-\d{2}-\d{2}\.csv$/);
    await find(render(), n => n.type === 'form').props.onSubmit({ preventDefault() {} });
    find(render(), n => n.type === 'button' && Array.isArray(n.props.children) && n.props.children.includes('Download all as CSV')).props.onClick();
    assert.match(filename, /^leads_Dentist_Oxford_\d{4}-\d{2}-\d{2}\.csv$/);
  } finally {
    globalThis.fetch = oldFetch;
    globalThis.document = oldDocument;
    globalThis.setTimeout = oldTimeout;
  }
});
