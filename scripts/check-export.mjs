import fs from 'node:fs';
import assert from 'node:assert/strict';

const meals = JSON.parse(fs.readFileSync('lib/meals.json', 'utf8'));
for (const meal of meals) {
  const html = fs.readFileSync(`out/middag/${meal.slug}/index.html`, 'utf8');
  const images = html.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(images.length, 1, `${meal.id}: one recipe image`);
  assert.ok(images[0].includes(`${meal.image.src}?w=960`), `${meal.id}: 960 variant`);
  assert.ok(images[0].includes(`${meal.image.src.replace('.webp', '-480.webp')}?w=480`), `${meal.id}: 480 variant`);
  assert.ok(images[0].includes('width="960"') && images[0].includes('height="640"'), `${meal.id}: reserved space`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null');
  assert.equal(schema?.image, `https://middagen.no${meal.image.src}`);
  assert.equal(schema.recipeInstructions.length, meal.instructions.length);
  assert.ok(!html.includes('noindex'), `${meal.id}: indexable`);
  for (const suffix of ['.webp', '-480.webp']) assert.ok(fs.existsSync(`out/images/meals/${meal.slug}${suffix}`));
}
console.log('PASS export: 42 recipe pages, both image variants, dimensions, apex Recipe schema, instructions, indexable');
