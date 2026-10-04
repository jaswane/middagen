import type { Metadata } from 'next';

// The apex is the only canonical host. www and the public vercel.app alias redirect here.
export const SITE_URL = 'https://middagen.no';
export const SITE_NAME = 'Middagen.no';
export const SITE_DESCRIPTION = 'Få tre konkrete middagstips med ett trykk. Velg etter tid, pris eller en ingrediens du har, og gå rett til en enkel oppskrift.';

/** Open Graph for a page. Next.js replaces, not merges, openGraph between layout and page. */
export function openGraph(path: string, title: string, description: string, image?: { src: string; alt: string; width: number; height: number }): Metadata['openGraph'] {
  return {
    type: 'website', locale: 'nb_NO', siteName: SITE_NAME, url: path, title, description,
    ...(image && { images: [{ url: image.src, alt: image.alt, width: image.width, height: image.height }] }),
  };
}
