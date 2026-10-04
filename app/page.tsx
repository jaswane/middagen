import type { Metadata } from 'next';
import { DinnerPicker } from '@/components/dinner-picker';
import data from '@/lib/meals.json';
import type { Meal, MealSummary } from '@/lib/types';
import { SITE_DESCRIPTION, openGraph } from '@/lib/site';
const heroImage = (data as Meal[]).find(meal => meal.id === 'laks-med-poteter')!.image;
export const metadata: Metadata = { alternates: { canonical: '/' }, openGraph: openGraph('/', 'Hva skal vi ha til middag?', SITE_DESCRIPTION, heroImage) };
export default function Home() {
  // Omit recipe-only fields from the interactive suggestion payload.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const summaries: MealSummary[] = (data as Meal[]).map(({ ingredients, instructions, tip, pantryIngredients, baseServings, ...meal }) => meal);
  return <main id="hovedinnhold"><DinnerPicker meals={summaries}/></main>;
}
