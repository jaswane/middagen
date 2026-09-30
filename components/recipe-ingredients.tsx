'use client';
import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { trackEvent, trackRecipeOpen } from '@/lib/analytics';
import { formatPortion } from '@/lib/portions';
export function RecipeIngredients({ ingredients, baseServings, mealSlug }: { ingredients: Ingredient[]; baseServings: number; mealSlug: string }) {
  const [servings, setServings] = useState(baseServings);
  const partialEgg = ingredients.some(i => i.name === 'egg' && i.quantity !== null && !Number.isInteger(i.quantity * servings / baseServings));
  useEffect(() => { trackRecipeOpen(mealSlug); }, [mealSlug]);
  function change(portions: number) { setServings(portions); trackEvent('portion_change', { meal_slug:mealSlug, portions }); }
  return <section aria-labelledby="ingredient-title"><h2 id="ingredient-title">Dette trenger du</h2><div className="serving-control"><span>Porsjoner</span><div className="serving-buttons"><button onClick={() => change(servings-1)} disabled={servings<=1} aria-label="Én porsjon mindre"><Minus size={16}/></button><output aria-live="polite">{servings} {servings === 1 ? 'person' : 'personer'}</output><button onClick={() => change(servings+1)} disabled={servings>=8} aria-label="Én porsjon mer"><Plus size={16}/></button></div></div><ul className="ingredients-list">{ingredients.map((i,index) => <li key={`${i.name}-${index}`}><span className="ingredient-quantity">{formatPortion(i, servings, baseServings)}</span><span>{i.name}</span></li>)}</ul>{partialEgg && <p className="small-note">For en del av et egg: visp egget og bruk den oppgitte andelen.</p>}<p className="small-note">Mengdene tilpasses. «Ca.» betyr avrundet mengde. Tilberedningstiden er et anslag for {baseServings} personer og kan øke med flere porsjoner.</p></section>;
}
