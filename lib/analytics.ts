// Google Analytics 4 with basic Consent Mode v2: gtag.js is not requested, and no
// measurement is sent, until the visitor has chosen «Tillat analyse» on the production host.
export const GA_MEASUREMENT_ID = 'G-RB2YJ9DF6M';
export const consentStorageKey = 'middagen_analytics_consent_v1';
export const consentOpenEvent = 'middagen:analytics-consent-open';
// www redirects to the apex. Previews, *.vercel.app, chatgpt.site and local hosts never send data.
export const analyticsHosts: readonly string[] = ['middagen.no'];

export type ConsentChoice = 'accepted' | 'rejected';
export type PickerMode = 'instant' | 'guided' | 'ingredient';
export type SuggestionSource = PickerMode | 'refresh';
export type TimeBucket = '15' | '30' | '45' | 'all' | 'other';
export type CategoryChoice = 'all' | 'kjott' | 'fisk' | 'vegetar' | 'other';
export type PriceChoice = 'all' | 'billig' | 'vanlig' | 'other';
type NoParams = Record<string, never>;

/** Every product event and its parameters. Add new events here, never as ad hoc strings in the UI. */
export interface AnalyticsEvents {
  instant_suggestions_click: NoParams;
  suggestions_shown: { source: SuggestionSource; result_count: number };
  suggestions_refresh: { visible_count: number };
  decide_for_me: NoParams;
  meal_selected: { meal_slug: string; source: PickerMode };
  guided_picker_start: NoParams;
  guided_picker_complete: { time_bucket: TimeBucket; category: CategoryChoice; price_tier: PriceChoice; result_count: number };
  // ingredient_family is always a term from the recipe data, never the visitor's own text.
  ingredient_search_result: { result_count: number; ingredient_family: string };
  ingredient_search_no_result: NoParams;
  recipe_open: { meal_slug: string; source?: PickerMode };
  portion_change: { meal_slug: string; portions: number };
}
export type AnalyticsEventName = keyof AnalyticsEvents;
type EventArgs<K extends AnalyticsEventName> = AnalyticsEvents[K] extends NoParams ? [] : [AnalyticsEvents[K]];

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag } & Record<string, unknown>;

let status: 'idle' | 'off' | 'on' = 'idle';
let tagRequested = false;
let memoryChoice: ConsentChoice | null = null;
let pendingRecipe: { slug: string; source: PickerMode } | null = null;
let lastPageView: string | null = null;

const browser = () => typeof window === 'undefined' ? null : window as unknown as AnalyticsWindow;
const disableFlag = `ga-disable-${GA_MEASUREMENT_ID}`;

export function isAnalyticsHost(hostname: string, protocol: string) {
  return protocol === 'https:' && analyticsHosts.includes(hostname);
}
function onAnalyticsHost(w: AnalyticsWindow) { return isAnalyticsHost(w.location.hostname, w.location.protocol); }

export function readConsent(): ConsentChoice | null {
  const w = browser();
  if (!w) return null;
  try {
    const value = w.localStorage.getItem(consentStorageKey);
    return value === 'accepted' || value === 'rejected' ? value : memoryChoice;
  } catch { return memoryChoice; }
}

function installGtag(w: AnalyticsWindow): Gtag {
  w.dataLayer = w.dataLayer ?? [];
  if (!w.gtag) {
    const dataLayer = w.dataLayer;
    // gtag.js reads the Arguments object, not a plain array.
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    };
    w.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  }
  return w.gtag;
}

function enable(w: AnalyticsWindow) {
  const gtag = installGtag(w);
  w[disableFlag] = false;
  // Only analytics is granted. We do not use Google Ads, remarketing or ad personalisation.
  gtag('consent', 'update', { analytics_storage: 'granted' });
  if (!tagRequested) {
    tagRequested = true;
    gtag('js', new Date());
    // config sends the page_view for this page load; trackPageView covers App Router navigations.
    gtag('config', GA_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    lastPageView = w.location.pathname;
    const script = w.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    w.document.head.appendChild(script);
  }
  status = 'on';
}

function disable(w: AnalyticsWindow) {
  status = 'off';
  if (tagRequested) {
    w.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    w[disableFlag] = true;
  }
  clearAnalyticsCookies(w);
}

// Removes the first-party GA cookies on this site. Data Google has already received is not affected.
function clearAnalyticsCookies(w: AnalyticsWindow) {
  const names = w.document.cookie.split(';').map(c => c.split('=')[0].trim())
    .filter(name => name === '_ga' || name.startsWith('_ga_'));
  for (const name of names) for (const domain of ['', `; domain=.${w.location.hostname}`])
    w.document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
}

/** Applies a stored choice once per page load. Safe to call repeatedly. */
export function initAnalytics(): ConsentChoice | null {
  const w = browser();
  if (!w) return null;
  const choice = readConsent();
  if (status === 'idle') {
    if (choice === 'accepted' && onAnalyticsHost(w)) enable(w);
    else status = 'off';
  }
  return choice;
}

export function setAnalyticsConsent(choice: ConsentChoice) {
  const w = browser();
  if (!w) return;
  memoryChoice = choice;
  try { w.localStorage.setItem(consentStorageKey, choice); } catch { /* The choice then lasts for this page load only. */ }
  if (choice === 'accepted' && onAnalyticsHost(w)) enable(w);
  else disable(w);
}

function activeGtag() {
  if (status === 'idle') initAnalytics();
  const w = browser();
  return status === 'on' && w?.gtag ? { w, gtag: w.gtag } : null;
}

/**
 * One page_view per client-side navigation. GA4's history-based page views did not fire for
 * App Router navigations on middagen.no (checked 30 Sep 2026), so the app sends them itself.
 * Deduplicated by path, so repeated effects or events on the same page never add a second one.
 */
export function trackPageView() {
  const active = activeGtag();
  if (!active || active.w.location.pathname === lastPageView) return;
  lastPageView = active.w.location.pathname;
  // No page_title: during navigation the new <title> may not be in the document yet. gtag.js
  // reads the title itself when it builds the hit, which gave the correct title in live checks.
  active.gtag('event', 'page_view', { page_location: active.w.location.href });
}

/** Sends a typed product event. A no-op without consent or outside the production host. */
export function trackEvent<K extends AnalyticsEventName>(name: K, ...params: EventArgs<K>) {
  const active = activeGtag();
  if (!active) return;
  // An event can run before the route effect (e.g. recipe_open); count the new page first.
  trackPageView();
  active.gtag('event', name, params[0] ?? {});
}

export function trackMealSelected(slug: string, source: PickerMode) {
  pendingRecipe = { slug, source };
  trackEvent('meal_selected', { meal_slug: slug, source });
}

export function trackRecipeOpen(slug: string) {
  const source = pendingRecipe?.slug === slug ? pendingRecipe.source : undefined;
  pendingRecipe = null;
  trackEvent('recipe_open', source ? { meal_slug: slug, source } : { meal_slug: slug });
}

/** Only the matched vocabulary term is sent. The text the visitor typed is never passed in. */
export function trackIngredientSearch(match: { ingredient: string | null; intent: string | null }, resultCount: number) {
  const family = match.intent ?? match.ingredient;
  if (resultCount > 0 && family) trackEvent('ingredient_search_result', { result_count: resultCount, ingredient_family: family });
  else trackEvent('ingredient_search_no_result');
}

const pick = <T extends string>(value: string, allowed: readonly T[]) => (allowed as readonly string[]).includes(value) ? value as T : 'other';
export function guidedPickerParams(filters: { time: string; type: string; price: string }, resultCount: number): AnalyticsEvents['guided_picker_complete'] {
  return {
    time_bucket: pick<TimeBucket>(filters.time, ['15', '30', '45', 'all']),
    category: pick<CategoryChoice>(filters.type, ['all', 'kjott', 'fisk', 'vegetar']),
    price_tier: pick<PriceChoice>(filters.price, ['all', 'billig', 'vanlig']),
    result_count: resultCount,
  };
}

export function openConsentSettings() {
  browser()?.dispatchEvent(new Event(consentOpenEvent));
}
