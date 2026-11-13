const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { exports });
  return exports;
}
const { advertising } = load('lib/ads.ts');
const { allowsAds } = load('lib/ad-policy.ts');
test('production tag uses the owner supplied Vignette URL and matching zone', () => {
  assert.equal(advertising.script_url, 'https://n6wxm.com/vignette.min.js');
  assert.equal(advertising.attributes['data-zone'], '12250721');
});
test('ads allow only production discovery pages, excluding playback and previews', () => {
  for (const host of ['slidra.in', 'www.slidra.in']) {
    for (const route of ['/', '/browse', '/series/11111111-1111-4111-8111-111111111111'])
      assert.equal(allowsAds(advertising, host, route), true);
    for (const route of ['/watch/11111111-1111-4111-8111-111111111111', '/about', '/login', '/api/playback/test'])
      assert.equal(allowsAds(advertising, host, route), false);
  }
  for (const host of ['localhost', 'admin.slidra.in', 'slidra.in.evil.test', 'mixpro-web.vercel.app'])
    assert.equal(allowsAds(advertising, host, '/'), false);
  assert.equal(allowsAds({ ...advertising, enabled: false }, 'slidra.in', '/'), false);
});
