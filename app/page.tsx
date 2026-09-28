import type { Metadata } from 'next';
import { DinnerPicker } from '@/components/dinner-picker';
import data from '@/lib/meals.json';
import type { Meal, MealSummary } from '@/lib/types';
export const metadata: Metadata = { alternates: { canonical: '/' } };
export default function Home() {
  // Omit recipe-only fields from the interactive suggestion payload.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const summaries: MealSummary[] = (data as Meal[]).map(({ ingredients, instructions, tip, pantryIngredients, baseServings, ...meal }) => meal);
  return <main id="hovedinnhold"><DinnerPicker meals={summaries}/></main>;
}
