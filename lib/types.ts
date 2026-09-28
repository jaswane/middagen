export type CostTier = 'billig' | 'vanlig' | 'litt-ekstra';
export type Category = 'kjott' | 'fisk' | 'vegetar';
export interface Ingredient { name: string; quantity: number | null; unit: string }
export interface Meal {
  id: string; slug: string; title: string; shortDescription: string;
  timeMinutes: number; costTier: CostTier; difficulty: 'enkel' | 'middels';
  familyFriendly: boolean; category: Category; mealTags: string[];
  mainIngredients: string[]; secondaryIngredients: string[]; pantryIngredients: string[];
  equipmentTags: string[]; baseServings: number; ingredients: Ingredient[];
  ingredientForms?: Record<string, string[]>;
  timeNote?: string;
  instructions: string[]; tip: string;
}
export type MealSummary = Omit<Meal, 'ingredients' | 'instructions' | 'tip' | 'pantryIngredients' | 'baseServings'>;
export interface Filters { time: string; type: string; price: string }
export const defaultFilters: Filters = { time: 'all', type: 'all', price: 'all' };
export const costLabels: Record<CostTier, string> = { billig: 'Rimelig', vanlig: 'Vanlig pris', 'litt-ekstra': 'Litt ekstra' };
export const categoryLabels: Record<Category, string> = { kjott: 'Kjøtt', fisk: 'Fisk', vegetar: 'Vegetar' };
