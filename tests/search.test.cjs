const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function route({ maintenance = false, fail = false } = {}) {
  const exports = {};
  const entries = Array.from({ length: 12 }, (_, i) => ({ id: `series-${i}`, title: `Story ${i}`, genre: 'Drama', description: 'An ocean journey', cast_members: 'Jane Doe', poster_url: '/poster.jpg', release_year: 2026, asset_id: 'private', playback_id: 'private' }));
  const mocks = { '@/lib/catalog': { settings: async () => ({ maintenance }), catalog: async () => { if (fail) throw Error('database details'); return entries; } }, '@/lib/db': { publicError: () => Response.json({ error: 'Search failed' }, { status: 500 }) } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app/api/search/route.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, require: name => mocks[name], URL, Response });
  return q => exports.GET(new Request(`https://mixpro.test/api/search?q=${encodeURIComponent(q)}`));
}
test('search returns a bounded public response with no playback credentials', async () => {
  const response = await route()('');
  const body = await response.json();
  assert.equal(body.total, 12);
  assert.equal(body.results.length, 8);
  assert.deepEqual(Object.keys(body.results[0]).sort(), ['genre','id','poster_url','release_year','title']);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('search matches title, genre, cast and description without case sensitivity', async () => {
  for (const q of ['story 11', ' DRAMA ', 'jane', 'Ocean']) assert.ok((await (await route()(q)).json()).results.length);
  const body = await (await route()('missing title')).json();
  assert.equal(body.total, 0);
  assert.equal(body.results.length, 0);
});
test('maintenance blocks search and database failures use a safe response', async () => {
  assert.equal((await route({ maintenance: true })('story')).status, 503);
  const response = await route({ fail: true })('story');
  assert.equal(response.status, 500);
  assert.equal((await response.json()).error, 'Search failed');
});
