// Production checks after a Vercel deploy: node scripts/check-live.mjs
// Uses the network; not part of the build checks.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const SITE = 'https://middagen.no';
const meals = JSON.parse(fs.readFileSync('lib/meals.json', 'utf8'));
const get = (url, redirect = 'follow') => fetch(url, { redirect, headers: { 'user-agent': 'middagen-launch-check' } });
let checks = 0;
async function test(name, fn) { await fn(); checks++; console.log(`PASS ${name}`); }

await test('public pages: 200, apex self-canonical, indexable, no old host', async () => {
  const sample = ['/', '/om/', '/slik-velger-vi/', '/personvern/', '/kontakt/', ...meals.slice(0, 6).map(m => `/middag/${m.slug}/`)];
  for (const page of sample) {
    const res = await get(SITE + page, 'manual');
    assert.equal(res.status, 200, page);
    const html = await res.text();
    assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], SITE + page, page);
    assert.ok(!html.includes('noindex') && !/x-robots-tag/i.test([...res.headers.keys()].join()), page);
    assert.ok(!/chatgpt\.site|vercel\.app/.test(html), page);
  }
});
await test('robots.txt allows crawling and points to the apex sitemap', async () => {
  const res = await get(`${SITE}/robots.txt`);
  assert.equal(res.status, 200);
  const robots = await res.text();
  assert.match(robots, /^Allow: \/$/m);
  assert.ok(!/^Disallow: \/\s*$/m.test(robots));
  assert.match(robots, /^Sitemap: https:\/\/middagen\.no\/sitemap\.xml$/m);
});
await test('sitemap.xml lists 45 unique apex URLs that answer 200', async () => {
  const res = await get(`${SITE}/sitemap.xml`);
  assert.equal(res.status, 200);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(locs.length, meals.length + 3);
  assert.equal(new Set(locs).size, locs.length);
  for (const loc of locs) { assert.ok(loc.startsWith(`${SITE}/`)); assert.equal((await get(loc, 'manual')).status, 200, loc); }
});
await test('/prototype/ is gone (404)', async () => {
  assert.equal((await get(`${SITE}/prototype/`, 'manual')).status, 404);
});
await test('www and the vercel.app alias redirect permanently to the apex, keeping the path', async () => {
  for (const host of ['https://www.middagen.no', 'https://middagen-gamma.vercel.app']) for (const page of ['/', '/om/', `/middag/${meals[0].slug}/`]) {
    const res = await get(host + page, 'manual');
    assert.equal(res.status, 308, host + page);
    assert.equal(res.headers.get('location'), SITE + page, host + page);
  }
  assert.equal((await get(`${SITE}/`, 'manual')).status, 200, 'apex answers directly, no loop');
});
console.log(JSON.stringify({ checks }));
