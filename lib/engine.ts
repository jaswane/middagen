import { type Filters, type MealSummary } from './types';
import { matchesIngredient } from './ingredients';
export { normalize, matchIngredient } from './ingredients';

export function filterMeals(meals: MealSummary[], filters: Filters, ingredient?: string | null) {
  return meals.filter(m => (filters.time === 'all' || m.timeMinutes <= Number(filters.time)) &&
    (filters.type === 'all' || (filters.type === 'familie' ? m.familyFriendly : filters.type === 'lett' ? m.mealTags.includes('lett') : m.category === filters.type)) &&
    (filters.price === 'all' || (filters.price === 'billig' ? m.costTier === 'billig' : m.costTier !== 'litt-ekstra')) &&
    (!ingredient || matchesIngredient(m, ingredient)));
}
function hash(value: string) { let n = 2166136261; for (const c of value) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
function variation(meal: MealSummary) {
  const tags = [...meal.mainIngredients, ...meal.secondaryIngredients];
  const family = (tag: string) => tag.includes('bønner') ? 'bønner' : tag;
  const main = family(meal.mainIngredients.find(i => !['pasta', 'ris', 'poteter', 'hakkede tomater'].includes(i)) ?? meal.mainIngredients[0]);
  const base = ['pasta', 'ris', 'poteter', 'tortillalefser', 'couscous', 'brød'].find(i => tags.includes(i));
  const equipment = meal.equipmentTags.join(' ');
  const method = equipment.includes('stekeovn') ? 'ovn' : equipment.includes('stavmikser') ? 'suppe' : equipment.includes('stekepanne') ? 'panne' : equipment.includes('kasserolle') ? 'koking' : 'uten varme';
  return { main, base, method };
}
/** Strict pool first, unseen before seen; minimise similarity, seeded tie-break. */
export function suggest(pool: MealSummary[], seed: number, excluded: string[] = [], count = 3): MealSummary[] {
  const ranked = [...pool].sort((a,b) => hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id));
  const chosen: MealSummary[] = [];
  while (chosen.length < Math.min(count, ranked.length)) {
    const remaining = ranked.filter(m => !chosen.some(c => c.id === m.id));
    const unseen = remaining.filter(m => !excluded.includes(m.id));
    const candidates = unseen.length ? unseen : remaining;
    const penalty = (meal: MealSummary) => {
      const v = variation(meal);
      return chosen.reduce((sum, other) => { const c = variation(other); return sum +
        (other.category === meal.category ? 100 : 0) + (v.main === c.main ? 20 : 0) +
        (v.base && v.base === c.base ? 10 : 0) + (v.method === c.method ? 3 : 0); }, 0);
    };
    candidates.sort((a,b) => penalty(a) - penalty(b));
    chosen.push(candidates[0]);
  }
  return chosen;
}
export function reason(meal: MealSummary, filters: Filters, ingredient?: string | null) {
  if (ingredient) return `Med ${ingredient}.`;
  if (filters.type === 'vegetar') return 'Uten kjøtt og fisk.';
  return filters.price !== 'all' && meal.costTier === 'billig' ? 'Med rimelige råvarer.' : '';
}
