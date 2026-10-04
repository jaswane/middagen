// Launch rules for the static build in out/. Run after `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const SITE = 'https://middagen.no';
const meals = JSON.parse(fs.readFileSync('lib/meals.json', 'utf8'));
const publicPages = ['/', '/om/', '/slik-velger-vi/', '/personvern/', '/kontakt/', ...meals.map(m => `/middag/${m.slug}/`)];
const sitemapPages = ['/', '/om/', '/slik-velger-vi/', ...meals.map(m => `/middag/${m.slug}/`)];
const oldHosts = /chatgpt\.site|chatgpt-team|vercel\.app|localhost|127\.0\.0\.1|www\.middagen\.no/;
const read = page => fs.readFileSync(path.join('out', page, 'index.html'), 'utf8');
const attr = (html, re) => html.match(re)?.[1] ?? null;
const canonicalOf = html => attr(html, /<link rel="canonical" href="([^"]+)"/);
let checks = 0;
function test(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }

test('1-2. every public page is self-canonical on the apex, including / and all recipes', () => {
  for (const page of publicPages) assert.equal(canonicalOf(read(page)), SITE + page, page);
});
test('3. no old host in canonical, Open Graph, schema or any built HTML/RSC file', () => {
  for (const file of files('out').filter(f => /\.(html|txt|xml)$/.test(f)))
    assert.ok(!oldHosts.test(fs.readFileSync(file, 'utf8')), file);
  for (const page of publicPages) {
    const html = read(page);
    assert.equal(attr(html, /<meta property="og:url" content="([^"]+)"/), SITE + page, `${page} og:url`);
    assert.ok(attr(html, /<meta property="og:title" content="([^"]+)"/), `${page} og:title`);
  }
});
test('4. no noindex anywhere public; one H1 and a unique title per page', () => {
  const titles = new Set();
  for (const page of publicPages) {
    const html = read(page);
    assert.ok(!/<meta name="robots"[^>]*noindex/.test(html) && !html.includes('noindex'), page);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${page} H1`);
    const title = attr(html, /<title>([^<]+)<\/title>/);
    assert.ok(title && !titles.has(title), `${page} unique title`);
    titles.add(title);
    assert.ok(!/prototyp|pre-?launch|ennå ikke lansert|før offentlig lansering/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), `${page} launch wording`);
  }
});
test('   Recipe schema uses the apex and matches the visible recipe', () => {
  for (const meal of meals) {
    const html = read(`/middag/${meal.slug}/`);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema['@type'], 'Recipe');
    assert.equal(schema.name, meal.title);
    assert.ok(html.includes(`<h1>${meal.title}</h1>`), meal.slug);
    assert.equal(schema.image, `${SITE}${meal.image.src}`);
  }
});
test('5-6. robots.txt allows crawling and points to the apex sitemap', () => {
  const robots = fs.readFileSync('out/robots.txt', 'utf8');
  assert.match(robots, /^User-Agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.ok(!/^Disallow: \/\s*$/m.test(robots), 'no blanket Disallow');
  assert.match(robots, /^Sitemap: https:\/\/middagen\.no\/sitemap\.xml$/m);
});
test('7-9. sitemap: all 42 recipes plus /, /om/, /slik-velger-vi/; unique, canonical, indexable, no lastmod', () => {
  const xml = fs.readFileSync('out/sitemap.xml', 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(locs.length, sitemapPages.length);
  assert.equal(new Set(locs).size, locs.length, 'no duplicates');
  assert.deepEqual([...locs].sort(), sitemapPages.map(p => SITE + p).sort());
  assert.ok(!xml.includes('<lastmod>'), 'no invented freshness');
  for (const loc of locs) {
    const page = loc.slice(SITE.length);
    assert.ok(!/[?#]|prototype|\/go\/|404|kontakt|personvern/.test(page), loc);
    const html = read(page);
    assert.equal(canonicalOf(html), loc, `${loc} self-canonical`);
    assert.ok(!html.includes('noindex'), `${loc} indexable`);
  }
});
test('10. /prototype/ is gone from the build and is never linked', () => {
  assert.ok(!fs.existsSync('out/prototype'));
  assert.ok(!fs.existsSync('app/prototype'));
  for (const file of files('out').filter(f => f.endsWith('.html'))) assert.ok(!fs.readFileSync(file, 'utf8').includes('/prototype'), file);
});
// 11-12. www and the vercel.app alias are Vercel domain redirects (project settings), verified by check-live.mjs.
test('14. footer credit on every page; the contact address only on /kontakt', () => {
  for (const page of [...publicPages, '404']) {
    const html = page === '404' ? fs.readFileSync('out/404.html', 'utf8') : read(page);
    assert.ok(html.includes('© 2026 Middagen.no · Et prosjekt fra <a href="https://swanecreative.no/">Swane Creative</a>'), page);
  }
  for (const file of files('out').filter(f => /\.(html|txt|xml|json)$/.test(f))) {
    const inKontakt = file.split(path.sep).slice(1)[0] === 'kontakt';
    if (!inKontakt) assert.ok(!fs.readFileSync(file, 'utf8').includes('kontakt@swanecreative.no'), file);
  }
  const kontakt = read('/kontakt/');
  assert.ok(kontakt.includes('mailto:kontakt@swanecreative.no'));
  assert.ok(!kontakt.match(/<footer[\s\S]*<\/footer>/)[0].includes('kontakt@swanecreative.no'), 'not in the footer');
});
console.log(JSON.stringify({ checks, publicPages: publicPages.length, sitemapUrls: sitemapPages.length }));
