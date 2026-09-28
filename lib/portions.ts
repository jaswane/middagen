import type { Ingredient } from './types';
const decimal = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 2 });
function fraction(value: number, denominator: number) {
  const numerator = Math.round(value * denominator), whole = Math.floor(numerator / denominator), rest = numerator % denominator;
  const divisors = [8, 4, 2];
  const divisor = divisors.find(d => rest % d === 0 && denominator % d === 0) ?? 1;
  return rest === 0 ? String(whole) : `${whole ? `${whole} ` : ''}${rest / divisor}/${denominator / divisor}`;
}
/** Presentation only: always scale from the original quantity, never a rounded result. */
export function formatPortion(ingredient: Ingredient, servings: number, baseServings: number): string {
  if (ingredient.quantity === null) return ingredient.unit || 'Litt';
  const value = ingredient.quantity * servings / baseServings;
  let unit = ingredient.unit, amount = value, step = 0;
  if (unit === 'kg') { amount *= 1000; unit = 'g'; }
  if (unit === 'l' || unit === 'dl') { amount *= unit === 'l' ? 1000 : 100; unit = 'ml'; }
  if ((unit === 'g' || unit === 'ml') && amount < .5) return `under 0,5 ${unit}`;
  if (unit === 'g' || unit === 'ml') step = amount >= 100 ? 5 : amount >= 10 ? 1 : .5;
  if (step) {
    const rounded = Math.max(step, Math.round(amount / step) * step);
    return `${Math.abs(rounded - amount) > .00001 ? 'ca. ' : ''}${decimal.format(rounded)} ${unit}`;
  }
  if (unit === 'ss' && value < .25) return formatPortion({ ...ingredient, quantity: ingredient.quantity * 3, unit: 'ts' }, servings, baseServings);
  if (unit === 'ts' && value < .125) return 'under 1/8 ts';
  if (unit === 'klype' && value < 1) return 'under 1 klype';
  if (['stk','skiver','ss','ts','boks','bokser','pakke','pakker'].includes(unit)) {
    const denominator = 8;
    if (value < 1 / denominator) return `under 1/${denominator} ${unit}`;
    const rounded = Math.round(value * denominator) / denominator;
    return `${Math.abs(rounded - value) > .00001 ? 'ca. ' : ''}${fraction(value, denominator)} ${unit}`;
  }
  return `${decimal.format(value)} ${unit}`.trim();
}
