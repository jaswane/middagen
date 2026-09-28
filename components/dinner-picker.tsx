'use client';
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock3, SlidersHorizontal, Search, RotateCw, ArrowUpRight, Utensils } from 'lucide-react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { type MealSummary, defaultFilters, costLabels, displayTagLabels } from '@/lib/types';
import { filterMeals, matchIngredient } from '@/lib/engine';
import { MealImage } from '@/components/meal-image';
import { type Mode, initialDecision, showDecision, refreshDecision, decideDinner, undoDinner, serializeDecision, restoreDecision, decisionStorageKey } from '@/lib/decision';
import { track } from '@/lib/analytics';

// In-memory fallback keeps client navigation working when browser storage is blocked.
let memoryDecision: string | null = null;
export function DinnerPicker({ meals }: { meals: MealSummary[] }) {
  const [state, setState] = useState(initialDecision);
  const [ready, setReady] = useState(false);
  const { mode, filters, applied, query, searched, ingredient, corrected, results, pool, single, error, notice } = state;
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const restoreScroll = useRef<number | null>(null);
  useLayoutEffect(() => {
    let raw = memoryDecision;
    try { raw = sessionStorage.getItem(decisionStorageKey) ?? raw; } catch { /* Storage can be disabled. */ }
    const saved = restoreDecision(raw, meals);
    // Restore the saved decision before paint, so Back does not flash fresh suggestions.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved) { setState(saved.state); restoreScroll.current = saved.scrollY; }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [meals]);
  useEffect(() => {
    if (!ready) return;
    memoryDecision = serializeDecision(state, meals, restoreScroll.current ?? window.scrollY);
    try { sessionStorage.setItem(decisionStorageKey, memoryDecision); } catch { /* Navigation still works in memory. */ }
  }, [state, meals, ready]);
  useLayoutEffect(() => {
    if (!ready || restoreScroll.current === null) return;
    const y = restoreScroll.current;
    const frame = requestAnimationFrame(() => {
      (results !== null ? resultHeading.current : mode === 'ingredient' ? searchInput.current : formHeading.current)?.focus({ preventScroll: true });
      window.scrollTo({ top: y, behavior: 'instant' });
      restoreScroll.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, results, mode]);
  const compact = mode !== null;
  const heroMeal = meals.find(meal => meal.id === 'laks-med-poteter')!;
  function focusResults() { requestAnimationFrame(() => {
    const heading = resultHeading.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }); }
  function rememberSelection(meal: MealSummary) {
    // This handler runs on link activation, never during render.
    // eslint-disable-next-line react-hooks/globals
    memoryDecision = serializeDecision(state, meals, window.scrollY);
    try { sessionStorage.setItem(decisionStorageKey, memoryDecision); } catch { /* See memory fallback. */ }
    track('meal_selected', { meal_id: meal.id, mode: mode ?? 'instant' });
  }
  function instant() {
    track('instant_suggestions_click');
    const next = showDecision({ ...state, corrected: false }, filterMeals(meals, { time:'45', type:'all', price:'all' }), 'instant');
    setState(next); track('suggestions_shown', { mode:'instant', count:next.results!.length }); focusResults();
  }
  function open(next: Mode) {
    setState({ ...state, mode:next, results:null, single:false, alternatives:[], error:'', notice:'' });
    if (next === 'guided') track('guided_picker_start');
    requestAnimationFrame(() => next === 'ingredient' ? searchInput.current?.focus() : formHeading.current?.focus());
  }
  function guided(e: FormEvent) {
    e.preventDefault(); track('guided_picker_complete', { ...filters });
    const next = showDecision({ ...state, corrected:false }, filterMeals(meals, filters), 'guided', filters);
    setState(next); track('suggestions_shown', { mode:'guided', count:next.results!.length }); focusResults();
  }
  function search(e?: FormEvent, value = query) {
    e?.preventDefault();
    if (!value.trim()) { setState({ ...state, error:'Skriv en ingrediens, for eksempel kylling.' }); searchInput.current?.focus(); return; }
    const match = matchIngredient(value, meals);
    const searchFilters = match.intent === 'vegetar' ? { ...defaultFilters, type:'vegetar' } : defaultFilters;
    const found = match.intent || match.ingredient ? filterMeals(meals, searchFilters, match.ingredient) : [];
    const next = showDecision({ ...state, query:value, searched:value.trim(), corrected:match.corrected }, found, 'ingredient', searchFilters, match.ingredient);
    setState(next); track('ingredient_search');
    track(found.length ? 'ingredient_search_result' : 'ingredient_search_no_result', { ingredient:match.intent ?? match.ingredient ?? 'unknown', count:found.length });
    focusResults();
  }
  function refresh() { setState(refreshDecision(state)); track('suggestions_refresh', { mode:mode ?? 'instant' }); focusResults(); }
  function decide() { setState(decideDinner(state)); focusResults(); }
  function undo() { setState(undoDinner(state)); focusResults(); }
  const resultTitle = !results?.length ? 'Vi fant ikke en middag som passer.' : single ? 'Da blir det denne.' : mode === 'ingredient' ? applied.type === 'vegetar' ? 'Vegetarmiddager' : `Middag med ${ingredient}` : 'Noe av dette i dag?';
  return <div className={results !== null ? 'dinner-picker has-results' : 'dinner-picker'}>
    <section className={`hero ${compact ? 'hero-compact' : ''}`} aria-labelledby="hero-title">
      <div className="hero-copy"><p className="eyebrow"><span className="small-rule"/> MIDDAGSTIPS PÅ SEKUNDET</p>
        <h1 id="hero-title">Hva skal vi ha<br className="desktop-break"/> til <em>middag?</em></h1>
        <p className="hero-description">Tre middager å velge mellom.</p>
        <button className="button button-primary hero-button" onClick={instant}>Gi meg middagstips <ArrowRight size={21}/></button>
        {!compact && <p className="button-note">Ett trykk. Tre forslag. Ingen konto.</p>}
      </div>
      {!compact && <figure className="hero-visual"><div className="photo-backdrop"/><MealImage image={heroMeal.image} sizes="(max-width: 1050px) 40vw, 510px" eager/><figcaption>Laks med poteter<span>Brokkoli, sitron og rømme ved siden av.</span></figcaption></figure>}
    </section>
    <div className="entry-points" aria-label="Tilpass middagstipsene"><span className="entry-label">Eller ta utgangspunkt i …</span>
      <button aria-expanded={mode === 'guided' && results === null} onClick={() => open('guided')} className={mode === 'guided' ? 'active' : ''}><SlidersHorizontal size={20}/><span>Hjelp meg å velge</span><ArrowUpRight size={19}/></button>
      <button aria-expanded={mode === 'ingredient' && results === null} onClick={() => open('ingredient')} className={mode === 'ingredient' ? 'active' : ''}><Search size={20}/><span>Jeg har en ingrediens</span><ArrowUpRight size={19}/></button>
    </div>
    {mode === 'guided' && results === null && <section className="picker-panel" aria-labelledby="guided-heading"><div className="panel-intro"><p className="eyebrow">DINE ØNSKER</p><h2 id="guided-heading" ref={formHeading} tabIndex={-1}>Hva passer i dag?</h2><p>Velg tid og type middag.</p></div>
      <form onSubmit={guided} className="guided-form"><div className="form-fields"><label htmlFor="time">Hvor god tid har du?<NativeSelect id="time" value={filters.time} onChange={e => setState({ ...state, filters:{ ...filters, time:e.target.value } })}><NativeSelectOption value="15">Maks 15 minutter</NativeSelectOption><NativeSelectOption value="30">Maks 30 minutter</NativeSelectOption><NativeSelectOption value="all">God tid / ingen grense</NativeSelectOption></NativeSelect></label>
      <label htmlFor="type">Hva frister?<NativeSelect id="type" value={filters.type} onChange={e => setState({ ...state, filters:{ ...filters, type:e.target.value } })}><NativeSelectOption value="all">Åpen for alt</NativeSelectOption><NativeSelectOption value="kjott">Kjøtt</NativeSelectOption><NativeSelectOption value="fisk">Fisk</NativeSelectOption><NativeSelectOption value="vegetar">Vegetarisk</NativeSelectOption></NativeSelect></label></div>
      <details className="price-details"><summary>Vil du også velge prisnivå?</summary><label htmlFor="price">Prisnivå<NativeSelect id="price" value={filters.price} onChange={e => setState({ ...state, filters:{ ...filters, price:e.target.value } })}><NativeSelectOption value="all">Spiller ingen rolle</NativeSelectOption><NativeSelectOption value="billig">Rimelig</NativeSelectOption><NativeSelectOption value="vanlig">Vanlig eller rimelig</NativeSelectOption></NativeSelect></label><p>Relative nivåer, ikke oppdaterte butikkpriser.</p></details>
      <button className="button button-primary" type="submit">Finn middagen <ArrowRight size={19}/></button></form></section>}
    {mode === 'ingredient' && results === null && <section className="picker-panel ingredient-panel" aria-labelledby="ingredient-heading"><div className="panel-intro"><p className="eyebrow">BRUK DET DU HAR</p><h2 id="ingredient-heading">Hva har du på kjøkkenet?</h2><p>Én ingrediens er nok til å komme i gang.</p></div><div><form onSubmit={e => search(e)} className="ingredient-form"><label htmlFor="ingredient">Jeg har …</label><div className="search-row"><input ref={searchInput} id="ingredient" maxLength={60} value={query} onChange={e => setState({ ...state, query:e.target.value, error:'' })} placeholder="For eksempel kylling" aria-invalid={!!error} aria-describedby={error ? 'search-error' : 'search-hint'}/><button className="button button-primary" type="submit">Finn middag <ArrowRight size={18}/></button></div><p id={error ? 'search-error' : 'search-hint'} className={error ? 'form-error' : 'field-hint'} role={error ? 'alert' : undefined}>{error || 'Søk på én råvare. Du kan også skrive vegetar.'}</p></form><div className="quick-ingredients"><span>Eller prøv:</span>{['kylling','kjøttdeig','laks','pasta','egg','poteter'].map(i => <button key={i} onClick={() => search(undefined,i)}>{i}<ArrowUpRight size={14}/></button>)}</div></div></section>}
    {results !== null && <section className="results-section" aria-labelledby="results-heading"><div className="results-heading"><div><p className="eyebrow">{single ? 'DAGENS MIDDAG' : mode === 'instant' ? 'LITT MINDRE Å TENKE PÅ' : 'DINE MIDDAGSFORSLAG'}</p><h2 id="results-heading" ref={resultHeading} tabIndex={-1}>{resultTitle}</h2></div>{results.length > 0 && !single && <span className="result-count">{results.length} forslag. Du velger.</span>}</div>
      <div className="result-context" aria-live="polite">{corrected && ingredient && <p>Vi tolket «{searched}» som {ingredient}. <button className="inline-link" onClick={() => open('ingredient')}>Endre søket</button></p>}{mode === 'guided' && <p>{applied.time === 'all' ? 'Ingen tidsgrense' : `Maks ${applied.time} min`} · {({all:'Alle typer',familie:'Familievennlig',kjott:'Kjøtt',fisk:'Fisk',vegetar:'Vegetarisk',lett:'Noe lett'} as Record<string,string>)[applied.type]} · {applied.price === 'all' ? 'Alle prisnivåer' : applied.price === 'billig' ? 'Rimelig' : 'Vanlig eller rimelig'}</p>}{notice && <p>{notice}</p>}</div>
      {results.length > 0 ? <><div className="decision-actions">{!single && pool.length > 3 && <button className="button button-secondary" onClick={refresh}><RotateCw size={18}/>Vis tre nye</button>}{!single && results.length > 1 && <button className="text-button" onClick={decide}>Bare bestem for meg <ArrowRight size={17}/></button>}{single && <button className="text-button undo-decision" onClick={undo}>Vis de samme alternativene igjen</button>}</div><div className={`meal-grid ${single ? 'single-result' : ''}`}>{results.map((meal,index) => <article key={meal.id} className={`meal-card category-${meal.category}`}>
        <div className="card-preview"><MealImage image={meal.image} className="meal-photo" eager={index === 0} sizes={single ? '(max-width: 760px) calc(100vw - 44px), 680px' : '(max-width: 760px) 104px, (max-width: 1050px) 30vw, 382px'}/><div className="card-heading">{meal.displayTags.length > 0 && <p className="display-tags">{meal.displayTags.map(tag => displayTagLabels[tag]).join(' · ')}</p>}<h3>{meal.title}</h3></div></div>
        <div className="card-content"><p>{meal.shortDescription}</p><div className="meal-meta"><span><Clock3 size={16}/>Ca. {meal.timeMinutes} min</span><span>{costLabels[meal.costTier]}</span></div>{meal.timeNote && <p className="time-note">{meal.timeNote}</p>}</div><Link prefetch={false} href={`/middag/${meal.slug}`} className="meal-choose" onClick={() => rememberSelection(meal)}>Se oppskriften<ArrowRight size={18}/></Link></article>)}</div>
      {pool.length < 3 && <p className="small-note">Vi fant {pool.length === 1 ? 'bare én rett' : 'bare to retter'} med disse ønskene. Endre {mode === 'ingredient' ? 'ingrediensen' : 'valgene'} for flere forslag.</p>}
      {mode !== 'instant' && <div className="result-actions"><button className="text-button" onClick={() => open(mode ?? 'guided')}>Endre {mode === 'ingredient' ? 'ingrediensen' : 'valgene'}</button></div>}</> : <Empty className="no-results"><EmptyHeader><Utensils size={30}/><EmptyTitle>{mode === 'ingredient' ? `Ingen treff på «${searched}» ennå.` : 'Prøv litt mer tid eller en annen type.'}</EmptyTitle><EmptyDescription>{mode === 'ingredient' ? 'Vi har et lite utvalg middager. Prøv en annen råvare, eller få tre tips uten ingrediensvalg.' : 'Vi beholder ønskene dine. Du bestemmer om du vil endre dem.'}</EmptyDescription></EmptyHeader><EmptyContent><button className="button button-primary" onClick={() => open(mode??'guided')}>{mode === 'ingredient' ? 'Prøv en annen ingrediens' : 'Endre valgene'}<ArrowRight size={18}/></button><button className="text-button" onClick={instant}>Gi meg tre middagstips</button></EmptyContent></Empty>}
    </section>}
    {!compact && <section className="everyday-note"><div className="note-heading"><span className="note-symbol">16:20</span><h2>Mindre leting.<br/><em>Mer middag.</em></h2></div><p>Vanlige råvarer. Middager det går an å lage.<br/>Vi hjelper deg fra «aner ikke» til «den tar vi».</p><Link href="/slik-velger-vi">Slik velger vi forslagene <ArrowUpRight size={17}/></Link></section>}
    {compact && <p className="method-link">Forslag fra vårt lille middagsutvalg. <Link href="/slik-velger-vi">Slik velger vi</Link></p>}
    <noscript><p>Slå på JavaScript for å få forslag, eller gå rett til <Link prefetch={false} href="/middag/laks-med-poteter">laks med poteter</Link>.</p></noscript>
  </div>;
}
