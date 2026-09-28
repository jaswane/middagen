import { type Filters, type MealSummary } from './types';
export const normalize = (value: string) => value.toLocaleLowerCase('nb-NO').trim().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
const aliases: Record<string, string> = { kyllingfilet:'kylling', kyllingbryst:'kylling', chicken:'kylling', laksefilet:'laks', salmon:'laks', torskefilet:'torsk', karbonadedeig:'kjøttdeig', kjottdeig:'kjøttdeig', potet:'poteter', eggene:'egg', polse:'pølser', polser:'pølser', spaghetti:'pasta', spagetti:'pasta', makaroni:'pasta', penne:'pasta', kikert:'kikerter', linse:'røde linser', linser:'røde linser', gulrotter:'gulrot', tomater:'tomat', halloumi:'vegetarisk halloumi', feta:'vegetarisk feta', pesto:'vegetarisk pesto', nudler:'eggnudler' };
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) { const row = [i]; for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1])); previous = row; }
  return previous[b.length];
}
export function matchIngredient(input: string, meals: MealSummary[]) {
  const query = normalize(input.replace(/^jeg har\s+/i, ''));
  const ingredients = [...new Set(meals.flatMap(m => [...m.mainIngredients, ...m.secondaryIngredients]))];
  const exact = ingredients.find(i => normalize(i) === query);
  if (exact) return { ingredient: exact, corrected: false };
  const alias = aliases[query];
  if (alias && ingredients.includes(alias)) return { ingredient: alias, corrected: normalize(alias) !== query };
  if (query.length < 4 || query.includes(' ')) return { ingredient: null, corrected: false };
  const candidates = ingredients.map(i => ({ ingredient: i, distance: distance(query, normalize(i)) })).filter(i => i.distance <= (query.length >= 7 ? 2 : 1)).sort((a,b) => a.distance - b.distance || a.ingredient.localeCompare(b.ingredient, 'nb'));
  if (candidates.length && (candidates.length === 1 || candidates[0].distance < candidates[1].distance)) return { ingredient: candidates[0].ingredient, corrected: true };
  return { ingredient: null, corrected: false };
}
export function filterMeals(meals: MealSummary[], filters: Filters, ingredient?: string | null) {
  return meals.filter(m => (filters.time === 'all' || m.timeMinutes <= Number(filters.time)) && (filters.type === 'all' || (filters.type === 'familie' ? m.familyFriendly : filters.type === 'lett' ? m.mealTags.includes('lett') : m.category === filters.type)) && (filters.price === 'all' || (filters.price === 'billig' ? m.costTier === 'billig' : m.costTier !== 'litt-ekstra')) && (!ingredient || [...m.mainIngredients, ...m.secondaryIngredients].includes(ingredient)));
}
function hash(value: string) { let n = 2166136261; for (const c of value) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
/** Reproducible seed, strict constraints, unseen meals first, then variety. */
export function suggest(pool: MealSummary[], seed: number, excluded: string[] = [], count = 3): MealSummary[] {
  const ranked = [...pool].sort((a,b) => Number(excluded.includes(a.id)) - Number(excluded.includes(b.id)) || hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id));
  const chosen: MealSummary[] = [];
  while (chosen.length < Math.min(count, ranked.length)) {
    const remaining = ranked.filter(m => !chosen.some(c => c.id === m.id));
    const unseen = remaining.filter(m => !excluded.includes(m.id));
    const candidates = unseen.length ? unseen : remaining;
    const varied = candidates.find(m => !chosen.some(c => c.category === m.category || c.mainIngredients[0] === m.mainIngredients[0]));
    chosen.push(varied ?? candidates[0]);
  }
  return chosen;
}
export function reason(meal: MealSummary, filters: Filters, ingredient?: string | null) {
  if (ingredient) return `Bruker ${ingredient} · omtrent ${meal.timeMinutes} minutter.`;
  const parts = [`Omtrent ${meal.timeMinutes} minutter`];
  if (filters.price !== 'all' && meal.costTier === 'billig') parts.push('rimelige råvarer');
  if (filters.type === 'familie') parts.push('milde smaker');
  if (filters.type === 'vegetar') parts.push('uten kjøtt og fisk');
  return parts.join(' · ') + '.';
}
