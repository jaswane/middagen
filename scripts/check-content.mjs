import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { load } from './test-support.mjs';

const meals = JSON.parse(fs.readFileSync('lib/meals.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('docs/image-manifest.json', 'utf8'));
const { displayTagLabels } = load('lib/types.ts');
const imageLoader = load('lib/image-loader.ts').default;
const unique = (values, label) => assert.equal(new Set(values).size, values.length, `Duplicate ${label}`);
function webpDimensions(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const kind = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4), data = offset + 8;
    assert.ok(data + size <= bytes.length, 'Truncated WebP chunk');
    if (kind === 'VP8X') return [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
    if (kind === 'VP8 ') return [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
    if (kind === 'VP8L') {
      const bits = bytes.readUInt32LE(data + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = data + size + (size % 2);
  }
  throw new Error('WebP has no dimensions');
}

assert.equal(meals.length, 42);
assert.equal(manifest.length, 42);
unique(meals.map(m => m.id), 'meal IDs');
unique(meals.map(m => m.slug), 'slugs');
unique(meals.map(m => m.shortDescription.trim().toLocaleLowerCase('nb')), 'descriptions');
unique(meals.map(m => m.image?.src), 'image paths');
unique(manifest.map(m => m.mealId), 'manifest IDs');
unique(manifest.map(m => m.variants[0].sha256), 'main image files');
let totalBytes = 0;
for (const m of meals) {
  const check = (condition, field) => assert.ok(condition, `${m.id}: ${field}`);
  check(m.shortDescription.trim().length > 15, 'concrete description required');
  check(Number.isInteger(m.timeMinutes) && m.timeMinutes > 0 && m.timeMinutes <= 180, 'time');
  check(['billig', 'vanlig', 'litt-ekstra'].includes(m.costTier), 'price tier');
  check(m.ingredients.length > 0 && m.instructions.length > 0, 'recipe required');
  check(Number.isInteger(m.baseServings) && m.baseServings > 0, 'base servings');
  check(m.instructions.every(step => typeof step === 'string' && step.trim().length > 0), 'empty step');
  check(m.ingredients.every(i => i.name.trim() && typeof i.unit === 'string' && (i.quantity === null || (Number.isFinite(i.quantity) && i.quantity > 0))), 'ingredient quantities');
  check(m.displayTags.length <= 2 && m.displayTags.every(tag => Object.hasOwn(displayTagLabels, tag)), 'display tags');
  unique(m.displayTags, `${m.id} display tags`);
  if (m.displayTags.includes('vegetar')) check(m.category === 'vegetar', 'vegetarian tag');
  if (m.displayTags.includes('fisk')) check(m.category === 'fisk', 'fish tag');
  if (m.displayTags.includes('ovnsrett')) check(m.equipmentTags.includes('stekeovn'), 'oven tag');
  if (m.displayTags.includes('en-panne')) check(m.equipmentTags.length === 1 && m.equipmentTags[0].includes('stekepanne'), 'one pan tag');
  if (m.displayTags.includes('en-gryte')) check(m.equipmentTags.filter(e => /kasserolle|gryte|panne|ovn/.test(e)).join() === 'kasserolle', 'one pot tag');
  if (m.displayTags.includes('uten-varme')) check(m.equipmentTags.join() === 'bolle', 'no heating tag');
  check(m.image.alt.trim().length > 15, 'descriptive alt');
  check(m.image.src === `/images/meals/${m.slug}.webp`, 'local image path');
  check(m.image.width === 960 && m.image.height === 640, '3:2 image dimensions');
  assert.equal(imageLoader({src:m.image.src,width:480}), `${m.image.src.replace('.webp','-480.webp')}?w=480`);
  assert.equal(imageLoader({src:m.image.src,width:960}), `${m.image.src}?w=960`);
  const entry = manifest.find(row => row.mealId === m.id);
  check(entry && entry.classification === 'generated' && entry.provenance && entry.source && /^\d{4}-\d{2}-\d{2}$/.test(entry.date), 'provenance');
  assert.equal(entry.file, `public${m.image.src}`);
  assert.equal(entry.alt, m.image.alt);
  assert.equal(entry.variants.length, 2);
  for (const [index, variant] of entry.variants.entries()) {
    const width = index === 0 ? 960 : 480, height = width * 2 / 3;
    const path = index === 0 ? entry.file : entry.file.replace('.webp', '-480.webp');
    assert.equal(variant.file, path);
    check(fs.existsSync(path), `missing image: ${path}`);
    const bytes = fs.readFileSync(path);
    assert.deepEqual(webpDimensions(bytes), [width, height]);
    assert.deepEqual([variant.width, variant.height], [width, height]);
    assert.equal(bytes.length, variant.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256);
    totalBytes += bytes.length;
  }
}
console.log(`PASS content: 42 recipes, unique descriptions/slugs, recipe fields and objective display tags`);
console.log(`PASS images: 84 local WebP files, dimensions, alt, SHA-256 and provenance (${totalBytes} bytes)`);
