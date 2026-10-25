// Structured data in the static build (out/), checked against the visible HTML and lib/meals.json.
// Run after `npm run build`.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const SITE = 'https://middagen.no';
const meals = JSON.parse(fs.readFileSync('lib/meals.json', 'utf8'));
const labels = { vegetar: 'vegetar', fisk: 'fisk', ovnsrett: 'ovnsrett', 'en-panne': 'én panne', 'en-gryte': 'én gryte', 'uten-varme': 'uten koking' };
const decode = s => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const read = page => fs.readFileSync(`out${page}index.html`, 'utf8');
const jsonLd = html => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
// Only fields backed by real data. No nutrition, video, ratings, author or dates we cannot vouch for.
const allowed = ['@context', '@type', 'name', 'description', 'totalTime', 'recipeYield', 'recipeCategory', 'image', 'recipeIngredient', 'keywords', 'recipeInstructions'];
let checks = 0;
function test(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }

test(`Recipe JSON-LD on all ${meals.length} recipe pages matches the visible recipe and the data`, () => {
  for (const meal of meals) {
    const page = `/middag/${meal.slug}/`, html = read(page);
    const [schema, ...rest] = jsonLd(html);
    assert.equal(rest.length, 0, `${page}: one JSON-LD block`);
    assert.equal(schema['@type'], 'Recipe');
    assert.deepEqual(Object.keys(schema).filter(k => !allowed.includes(k)), [], `${page}: no invented fields`);
    for (const absent of ['nutrition', 'video', 'aggregateRating', 'review', 'author', 'datePublished']) assert.ok(!(absent in schema), `${page}: no ${absent}`);
    assert.equal(schema.name, meal.title);
    assert.equal(decode(html.match(/<h1>([^<]+)<\/h1>/)[1]), meal.title, `${page}: name = visible H1`);
    assert.equal(schema.image, `${SITE}${meal.image.src}`);
    assert.ok(fs.existsSync(`public${meal.image.src}`), `${page}: image file exists`);
    assert.deepEqual(schema.recipeIngredient, meal.ingredients.map(i => `${i.quantity ?? ''} ${i.unit} ${i.name}`.trim()));
    assert.equal(schema.keywords, [...new Set([...meal.mainIngredients, ...meal.displayTags.map(t => labels[t])])].join(', '));
    assert.ok(!/middag/i.test(schema.keywords), `${page}: keywords do not repeat recipeCategory`);
    const visible = [...html.matchAll(/<li id="steg-(\d+)">([^<]*)<\/li>/g)].map(m => ({ n: Number(m[1]), text: decode(m[2]) }));
    assert.equal(visible.length, meal.instructions.length, `${page}: every step visible with an id`);
    assert.equal(schema.recipeInstructions.length, visible.length, `${page}: same number of steps`);
    schema.recipeInstructions.forEach((step, i) => {
      assert.equal(step['@type'], 'HowToStep');
      assert.equal(step.text, visible[i].text, `${page} step ${i + 1}: text = visible instruction`);
      assert.equal(visible[i].n, i + 1);
      assert.equal(step.url, `${SITE}${page}#steg-${i + 1}`, `${page} step ${i + 1}: url points to the visible step`);
      // No step names yet: a derived name was not good enough on all steps (see docs/README.md).
      assert.ok(!('name' in step) && !('image' in step) && !('video' in step), `${page} step ${i + 1}: only text and url`);
    });
  }
});

test(`/middager/ ItemList lists the ${meals.length} recipes in page order, with only type, position and url`, () => {
  const html = read('/middager/');
  const [list, ...rest] = jsonLd(html);
  assert.equal(rest.length, 0);
  assert.equal(list['@type'], 'ItemList');
  const items = list.itemListElement;
  assert.equal(items.length, meals.length);
  items.forEach((item, i) => {
    assert.deepEqual(Object.keys(item).sort(), ['@type', 'position', 'url']);
    assert.equal(item['@type'], 'ListItem');
    assert.equal(item.position, i + 1);
  });
  const urls = items.map(i => i.url);
  assert.equal(new Set(urls).size, urls.length, 'unique urls');
  assert.deepEqual([...urls].sort(), meals.map(m => `${SITE}/middag/${m.slug}/`).sort(), 'canonical recipe urls, none missing');
  const visibleOrder = [...html.matchAll(/<a\b[^>]*\bhref="(\/middag\/[^"]+)"/g)].map(m => SITE + m[1]);
  assert.deepEqual(urls, visibleOrder, 'same order as the visible list');
});

console.log(JSON.stringify({ checks, recipes: meals.length }));
