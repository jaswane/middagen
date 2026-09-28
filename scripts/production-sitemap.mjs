// Review the launch checklist before using this output on the public domain.
// This does not change the private prototype's noindex or empty sitemap.
import fs from 'node:fs';
const meals=JSON.parse(fs.readFileSync(new URL('../lib/meals.json',import.meta.url),'utf8'));
const routes=['/','/om/','/slik-velger-vi/','/personvern/','/kontakt/',...meals.map(m=>`/middag/${m.slug}/`)];
console.log('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+routes.map(route=>`  <url><loc>https://middagen.no${route}</loc></url>`).join('\n')+'\n</urlset>');
