import type { Metadata } from 'next';
import Link from 'next/link';
import meals from '@/lib/meals.json';
import { type Category, type Meal, categoryLabels, costLabels } from '@/lib/types';
import { MealImage } from '@/components/meal-image';
import { SITE_URL, openGraph } from '@/lib/site';

const all = meals as Meal[];
const description = `Alle ${all.length} middagene på Middagen.no, sortert etter kjøtt, fisk og vegetar, med tid og prisnivå.`;
export const metadata: Metadata = { title: 'Alle middager', description, alternates: { canonical: '/middager/' }, openGraph: openGraph('/middager/', 'Alle middager', description) };

const categories: Category[] = ['kjott', 'fisk', 'vegetar'];
const groups = categories.map(category => ({ category, list: all.filter(meal => meal.category === category).sort((a, b) => a.title.localeCompare(b.title, 'nb')) }));
// Host carousel summary page: every listed recipe, in page order, with only type, position and url.
const itemList = { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: groups.flatMap(g => g.list).map((meal, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/middag/${meal.slug}/` })) };

export default function Page() {
  return <main id="hovedinnhold" className="content-page dinner-index">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, '\\u003c') }}/>
    <p className="eyebrow">ALLE MIDDAGER</p>
    <h1>Hele utvalget.</h1>
    <p>{all.length} middager, sortert etter hovedråvare. Vil du heller ha tre forslag med én gang, bruk <Link href="/">middagsvelgeren</Link>.</p>
    {groups.map(({ category, list }) => {
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
