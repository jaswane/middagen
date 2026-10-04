import type { MetadataRoute } from 'next';
import meals from '@/lib/meals.json';
import { SITE_URL } from '@/lib/site';
export const dynamic = 'force-static';
// Pages with search value, built from the same data as the routes. /kontakt and /personvern stay
// indexable but are left out. No lastModified: there is no reliable per-page date to report.
export default function sitemap():MetadataRoute.Sitemap{
  return ['/', '/om/', '/slik-velger-vi/', ...meals.map(m => `/middag/${m.slug}/`)].map(path => ({ url: `${SITE_URL}${path}` }));
}
