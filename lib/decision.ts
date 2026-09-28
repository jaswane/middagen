import { defaultFilters, type Filters, type MealSummary } from './types';
import { suggest } from './engine';

export type Mode = 'instant' | 'guided' | 'ingredient';
export interface Decision {
  mode: Mode | null; filters: Filters; applied: Filters; query: string; searched: string;
  ingredient: string | null; corrected: boolean; results: MealSummary[] | null;
  pool: MealSummary[]; single: boolean; alternatives: MealSummary[]; previousNotice: string;
  error: string; round: number; seen: string[]; notice: string;
}
export const initialDecision = (): Decision => ({
  mode: null, filters: { ...defaultFilters }, applied: { ...defaultFilters }, query: '', searched: '',
  ingredient: null, corrected: false, results: null, pool: [], single: false,
  alternatives: [], previousNotice: '', error: '', round: 0, seen: [], notice: '',
});
export function showDecision(state: Decision, pool: MealSummary[], mode: Mode, filters = defaultFilters, ingredient: string | null = null, seed = Date.now() % 1000000): Decision {
  const round = state.round === 0 ? seed : state.round + 1;
  const results = suggest(pool, round);
  return { ...state, mode, pool, results, round, applied: filters, ingredient, single: false,
    alternatives: [], previousNotice: '', seen: results.map(m => m.id), notice: '', error: '' };
}
export function refreshDecision(state: Decision): Decision {
  const unseen = state.pool.filter(m => !state.seen.includes(m.id));
  const currentIds = state.results?.map(m => m.id) ?? [];
  const alternatives = state.pool.filter(m => !currentIds.includes(m.id));
  const results = suggest(alternatives.length >= 3 ? alternatives : state.pool, state.round + 1, unseen.length ? state.seen : currentIds);
  return { ...state, results, single: false, alternatives: [], previousNotice: '', round: state.round + 1,
    seen: unseen.length === 0 ? results.map(m => m.id) : [...new Set([...state.seen, ...results.map(m => m.id)])],
    notice: unseen.length === 0 ? 'Du har sett alle treffene. Her er en ny kombinasjon.' : unseen.length < 3 ? 'De siste usette forslagene, sammen med noen du har sett før.' : 'Tre nye forslag, med de samme ønskene.' };
}
export function decideDinner(state: Decision): Decision {
  if (!state.results || state.results.length < 2 || state.single) return state;
  return { ...state, alternatives: state.results, previousNotice: state.notice,
    results: [state.results[state.round % state.results.length]], single: true, notice: '' };
}
export function undoDinner(state: Decision): Decision {
  return state.single ? { ...state, results: state.alternatives, alternatives: [], single: false,
    notice: state.previousNotice, previousNotice: '' } : state;
}

export const decisionStorageKey = 'middagen.decision.v1';
// Only IDs and local UI state are stored. Changed recipe data invalidates stale sessions.
const signature = (meals: MealSummary[]) => JSON.stringify(meals);
export function serializeDecision(state: Decision, meals: MealSummary[], scrollY = 0) {
  return JSON.stringify({ version: 1, signature: signature(meals), scrollY, state: { ...state,
    results: state.results?.map(m => m.id) ?? null, pool: state.pool.map(m => m.id), alternatives: state.alternatives.map(m => m.id) } });
}
export function restoreDecision(raw: string | null, meals: MealSummary[]): { state: Decision; scrollY: number } | null {
  if (!raw || raw.length > 100000) return null;
  try {
    const saved = JSON.parse(raw), s = saved.state;
    if (saved.version !== 1 || saved.signature !== signature(meals) || !s) return null;
    if (![null, 'instant', 'guided', 'ingredient'].includes(s.mode)) return null;
    const validFilters = (f: Filters) => f && ['all','15','30','45'].includes(f.time) && ['all','kjott','fisk','vegetar'].includes(f.type) && ['all','billig','vanlig'].includes(f.price);
    if (!validFilters(s.filters) || !validFilters(s.applied)) return null;
    for (const key of ['query','searched','error','notice','previousNotice']) if (typeof s[key] !== 'string' || s[key].length > 500) return null;
    if (s.ingredient !== null && typeof s.ingredient !== 'string') return null;
    if (!['corrected','single'].every(k => typeof s[k] === 'boolean') || !Number.isSafeInteger(s.round) || s.round < 0) return null;
    const byId = new Map(meals.map(m => [m.id, m]));
    const validIds = (ids: unknown): ids is string[] => Array.isArray(ids) && ids.length <= meals.length && ids.every(id => typeof id === 'string' && byId.has(id)) && new Set(ids).size === ids.length;
    if (![s.pool,s.seen,s.alternatives].every(validIds) || (s.results !== null && !validIds(s.results))) return null;
    if (s.results?.length > 3 || s.alternatives.length > 3 || (s.single && (s.results?.length !== 1 || s.alternatives.length < 2))) return null;
    if ([...(s.results ?? []), ...s.alternatives].some(id => !s.pool.includes(id))) return null;
    const resolve = (ids: string[]) => ids.map(id => byId.get(id)!);
    return { state: { ...s, results: s.results === null ? null : resolve(s.results), pool: resolve(s.pool), alternatives: resolve(s.alternatives) },
      scrollY: Number.isFinite(saved.scrollY) && saved.scrollY >= 0 ? saved.scrollY : 0 };
  } catch { return null; }
}
