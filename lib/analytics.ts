// No analytics library, storage or network request is active in the prototype.
export type ProductEvent = 'instant_suggestions_click' | 'suggestions_shown' | 'suggestions_refresh' | 'meal_selected' | 'guided_picker_start' | 'guided_picker_complete' | 'ingredient_search' | 'ingredient_search_result' | 'ingredient_search_no_result' | 'recipe_open';
type Payload = Record<string, string | number | boolean>;
let consent = false;
let adapter: ((event: ProductEvent, data: Payload) => void) | undefined;
export function configureAnalytics(allowed: boolean, handler?: typeof adapter) { consent = allowed; adapter = allowed ? handler : undefined; }
export function track(event: ProductEvent, data: Payload = {}) { if (consent && adapter) adapter(event, data); }
