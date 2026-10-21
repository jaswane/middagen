import type { Metadata } from 'next';
import Link from 'next/link';
import meals from '@/lib/meals.json';
import { type Category, type Meal, categoryLabels, costLabels } from '@/lib/types';
import { MealImage } from '@/components/meal-image';
import { openGraph } from '@/lib/site';

const all = meals as Meal[];
const description = `Alle ${all.length} middagene på Middagen.no, sortert etter kjøtt, fisk og vegetar, med tid og prisnivå.`;
export const metadata: Metadata = { title: 'Alle middager', description, alternates: { canonical: '/middager/' }, openGraph: openGraph('/middager/', 'Alle middager', description) };

const categories: Category[] = ['kjott', 'fisk', 'vegetar'];

export default function Page() {
  return <main id="hovedinnhold" className="content-page dinner-index">
    <p className="eyebrow">ALLE MIDDAGER</p>
    <h1>Hele utvalget.</h1>
    <p>{all.length} middager, sortert etter hovedråvare. Vil du heller ha tre forslag med én gang, bruk <Link href="/">middagsvelgeren</Link>.</p>
    {categories.map(category => {
      const list = all.filter(meal => meal.category === category).sort((a, b) => a.title.localeCompare(b.title, 'nb'));
      return <section key={category} aria-labelledby={`gruppe-${category}`}>
        <h2 id={`gruppe-${category}`}>{categoryLabels[category]} <span className="dinner-index-count">{list.length}</span></h2>
        <ul className="dinner-index-list">{list.map(meal => <li key={meal.slug}>
          <Link href={`/middag/${meal.slug}/`}>
            <MealImage image={{ ...meal.image, alt: '' }} className="dinner-index-photo" sizes="72px"/>
            <span className="dinner-index-text"><span className="dinner-index-title">{meal.title}</span>{' '}<span className="dinner-index-meta">Ca. {meal.timeMinutes} min · {costLabels[meal.costTier]}</span></span>
          </Link>
        </li>)}</ul>
      </section>;
    })}
  </main>;
}
