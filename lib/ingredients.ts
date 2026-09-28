import type { MealSummary } from './types';

export const normalize = (value: string) => value.toLocaleLowerCase('nb-NO').trim()
  .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');

// Families are broader searches, not claims that their members are interchangeable.
export const ingredientFamilies: Record<string, string[]> = {
  sopp: ['sjampinjong'], bønner: ['kidneybønner', 'hvite bønner', 'svarte bønner'],
  linser: ['røde linser'], nudler: ['eggnudler'], fløte: ['matfløte'],
};
export const ingredientAliases: Record<string, string> = {
  potet: 'poteter', polse: 'pølser', polser: 'pølser', eggene: 'egg',
  kyllingfileter: 'kyllingfilet', kyllingbryst: 'kyllingfilet', 'kyllinglar med bein': 'kyllinglår',
  chicken: 'kylling', laksefilet: 'laks', laksefileter: 'laks', salmon: 'laks',
  torskefilet: 'torsk', torskefileter: 'torsk', karbonadedeig: 'kjøttdeig',
  spagetti: 'spaghetti', lasagneplate: 'lasagneplater',
  kikert: 'kikerter', bonne: 'bønner', bonner: 'bønner', kidneybonne: 'kidneybønner',
  'hvit bonne': 'hvite bønner', 'svart bonne': 'svarte bønner',
  linse: 'linser', gulrotter: 'gulrot', tomater: 'tomat', sjampinjonger: 'sjampinjong',
  halloumi: 'vegetarisk halloumi', feta: 'vegetarisk feta', pesto: 'vegetarisk pesto',
  pizzadeig: 'pizzabunn',
};
// Deliberately small correction list. Unknown words are never nearest-neighbour guesses.
export const ingredientTypos: Record<string, string> = {
  kyling: 'kylling', kyllign: 'kylling', kjotdeig: 'kjøttdeig',
  kjottdei: 'kjøttdeig', lask: 'laks', past: 'pasta', potetr: 'poteter',
};
export type IngredientMatch = { ingredient: string | null; intent: 'vegetar' | null; corrected: boolean };

export function matchesIngredient(meal: MealSummary, ingredient: string): boolean {
  const tags = [...meal.mainIngredients, ...meal.secondaryIngredients];
  if (tags.includes(ingredient)) return true;
  if (ingredientFamilies[ingredient]?.some(member => tags.includes(member))) return true;
  return Object.values(meal.ingredientForms ?? {}).some(forms => forms.includes(ingredient));
}

export function matchIngredient(input: string, meals: MealSummary[]): IngredientMatch {
  const query = normalize(input).replace(/^jeg har\s+/, '');
  if (query === 'vegetar' || query === 'vegetarisk') return { ingredient: null, intent: 'vegetar', corrected: false };
  const vocabulary = [...new Set([
    ...meals.flatMap(m => [...m.mainIngredients, ...m.secondaryIngredients, ...Object.values(m.ingredientForms ?? {}).flat()]),
    ...Object.keys(ingredientFamilies),
  ])];
  const exact = vocabulary.find(i => normalize(i) === query);
  if (exact) return { ingredient: exact, intent: null, corrected: false };
  const canonical = ingredientAliases[query] ?? ingredientTypos[query];
  if (canonical && vocabulary.includes(canonical)) return { ingredient: canonical, intent: null, corrected: normalize(canonical) !== query };
  return { ingredient: null, intent: null, corrected: false };
}
