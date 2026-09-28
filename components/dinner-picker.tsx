'use client';
import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock3, SlidersHorizontal, Search, RotateCw, ArrowUpRight, Check, Utensils } from 'lucide-react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { type MealSummary, type Filters, defaultFilters, costLabels, categoryLabels } from '@/lib/types';
import { filterMeals, matchIngredient, suggest, reason } from '@/lib/engine';
import { track } from '@/lib/analytics';

type Mode = 'instant' | 'guided' | 'ingredient';
export function DinnerPicker({ meals }: { meals: MealSummary[] }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [applied, setApplied] = useState<Filters>(defaultFilters);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [ingredient, setIngredient] = useState<string | null>(null);
  const [corrected, setCorrected] = useState(false);
  const [results, setResults] = useState<MealSummary[] | null>(null);
  const [pool, setPool] = useState<MealSummary[]>([]);
  const [single, setSingle] = useState(false);
  const [error, setError] = useState('');
  const [round, setRound] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const compact = mode !== null;
  function focusResults() { requestAnimationFrame(() => resultHeading.current?.focus({ preventScroll: false })); }
  function show(nextPool: MealSummary[], nextMode: Mode, nextFilters = defaultFilters, term: string | null = null) {
    const nextSeed = round === 0 ? Date.now() % 1000000 : round + 1;
    const next = suggest(nextPool, nextSeed);
    setRound(nextSeed); setMode(nextMode); setPool(nextPool); setResults(next); setSingle(false);
    setApplied(nextFilters); setIngredient(term); setSeen(next.map(m => m.id)); setNotice(''); setError('');
    track('suggestions_shown', { mode: nextMode, count: next.length }); focusResults();
  }
  function instant() { track('instant_suggestions_click'); setCorrected(false); show(filterMeals(meals, { time:'45', type:'all', price:'all' }), 'instant'); }
  function open(next: Mode) {
    setMode(next); setResults(null); setError(''); setNotice('');
    if (next === 'guided') track('guided_picker_start');
    requestAnimationFrame(() => next === 'ingredient' ? searchInput.current?.focus() : formHeading.current?.focus());
  }
  function guided(e: FormEvent) { e.preventDefault(); setCorrected(false); track('guided_picker_complete', { ...filters }); show(filterMeals(meals, filters), 'guided', filters); }
  function search(e?: FormEvent, value = query) {
    e?.preventDefault();
    if (!value.trim()) { setError('Skriv en ingrediens, for eksempel kylling.'); searchInput.current?.focus(); return; }
    setQuery(value); setSearched(value.trim()); const match = matchIngredient(value, meals);
    setCorrected(match.corrected);
    const found = match.ingredient ? filterMeals(meals, defaultFilters, match.ingredient) : [];
    track('ingredient_search'); track(found.length ? 'ingredient_search_result' : 'ingredient_search_no_result', { ingredient: match.ingredient ?? 'unknown', count: found.length });
    show(found, 'ingredient', defaultFilters, match.ingredient);
  }
  function refresh() {
    const unseen = pool.filter(m => !seen.includes(m.id));
    const currentIds = results?.map(m => m.id) ?? [];
    const alternatives = pool.filter(m => !currentIds.includes(m.id));
    const next = suggest(alternatives.length >= 3 ? alternatives : pool, round + 1, unseen.length ? seen : currentIds);
    setNotice(unseen.length === 0 ? 'Du har sett alle treffene. Her er en ny kombinasjon.' : unseen.length < 3 ? 'De siste usette forslagene, sammen med noen du har sett før.' : 'Tre nye forslag, med de samme ønskene.');
    setSeen(unseen.length === 0 ? next.map(m => m.id) : [...new Set([...seen, ...next.map(m => m.id)])]);
    setRound(round + 1); setResults(next); setSingle(false); track('suggestions_refresh', { mode: mode ?? 'instant' }); focusResults();
  }
  function decide() { if (!results?.length) return; const chosen = results[round % results.length]; setResults([chosen]); setSingle(true); setNotice('Ett forslag. Middagen er et valg unna.'); focusResults(); }
  const resultTitle = !results?.length ? 'Vi fant ikke en middag som passer.' : single ? 'Da blir det denne.' : mode === 'ingredient' ? `Middag med ${ingredient}` : 'Noe av dette i dag?';
  return <>
    <section className={`hero ${compact ? 'hero-compact' : ''}`} aria-labelledby="hero-title">
      <div className="hero-copy"><p className="eyebrow"><span className="small-rule"/> MIDDAGSTIPS PÅ SEKUNDET</p>
        <h1 id="hero-title">Hva skal vi ha<br className="desktop-break"/> til <em>middag?</em></h1>
        <p className="hero-description">Du trenger ikke flere valg.<br/> Bare noen gode forslag.</p>
        <button className="button button-primary hero-button" onClick={instant}>Gi meg middagstips <ArrowRight size={21}/></button>
        {!compact && <p className="button-note">Ett trykk. Tre forslag. Ingen konto.</p>}
      </div>
      {!compact && <figure className="hero-visual"><div className="photo-backdrop"/><img src="/images/laks.webp" width="768" height="512" alt="Laks med poteter, brokkoli og sitron på en hvit tallerken" fetchPriority="high"/><figcaption>Det trenger ikke være vanskelig.<span>Det trenger bare å bli middag.</span></figcaption><span className="photo-label">HELT VANLIG. VELDIG GODT.</span></figure>}
    </section>
    <div className="entry-points" aria-label="Tilpass middagstipsene"><span className="entry-label">Eller ta utgangspunkt i …</span>
      <button aria-expanded={mode === 'guided' && results === null} onClick={() => open('guided')} className={mode === 'guided' ? 'active' : ''}><SlidersHorizontal size={20}/><span>Hjelp meg å velge</span><ArrowUpRight size={19}/></button>
      <button aria-expanded={mode === 'ingredient' && results === null} onClick={() => open('ingredient')} className={mode === 'ingredient' ? 'active' : ''}><Search size={20}/><span>Jeg har en ingrediens</span><ArrowUpRight size={19}/></button>
    </div>
    {mode === 'guided' && results === null && <section className="picker-panel" aria-labelledby="guided-heading"><div className="panel-intro"><p className="eyebrow">LITT MER DEG</p><h2 id="guided-heading" ref={formHeading} tabIndex={-1}>Hva passer i dag?</h2><p>Velg det som betyr noe. Resten finner vi ut av.</p></div>
      <form onSubmit={guided} className="guided-form"><div className="form-fields"><label htmlFor="time">Hvor god tid har du?<NativeSelect id="time" value={filters.time} onChange={e => setFilters({ ...filters, time:e.target.value })}><NativeSelectOption value="15">Maks 15 minutter</NativeSelectOption><NativeSelectOption value="30">Maks 30 minutter</NativeSelectOption><NativeSelectOption value="all">God tid / ingen grense</NativeSelectOption></NativeSelect></label>
      <label htmlFor="type">Hva frister?<NativeSelect id="type" value={filters.type} onChange={e => setFilters({ ...filters, type:e.target.value })}><NativeSelectOption value="all">Åpen for alt</NativeSelectOption><NativeSelectOption value="familie">Familievennlig</NativeSelectOption><NativeSelectOption value="kjott">Kjøtt</NativeSelectOption><NativeSelectOption value="fisk">Fisk</NativeSelectOption><NativeSelectOption value="vegetar">Vegetarisk</NativeSelectOption><NativeSelectOption value="lett">Noe lett</NativeSelectOption></NativeSelect></label></div>
      <details className="price-details"><summary>Vil du også velge prisnivå?</summary><label htmlFor="price">Prisnivå<NativeSelect id="price" value={filters.price} onChange={e => setFilters({ ...filters, price:e.target.value })}><NativeSelectOption value="all">Spiller ingen rolle</NativeSelectOption><NativeSelectOption value="billig">Rimelig</NativeSelectOption><NativeSelectOption value="vanlig">Vanlig eller rimelig</NativeSelectOption></NativeSelect></label><p>Relative nivåer, ikke oppdaterte butikkpriser.</p></details>
      <button className="button button-primary" type="submit">Finn middagen <ArrowRight size={19}/></button></form></section>}
    {mode === 'ingredient' && results === null && <section className="picker-panel ingredient-panel" aria-labelledby="ingredient-heading"><div className="panel-intro"><p className="eyebrow">BRUK DET DU HAR</p><h2 id="ingredient-heading">Hva har du på kjøkkenet?</h2><p>Én ingrediens er nok til å komme i gang.</p></div><div><form onSubmit={e => search(e)} className="ingredient-form"><label htmlFor="ingredient">Jeg har …</label><div className="search-row"><input ref={searchInput} id="ingredient" maxLength={60} value={query} onChange={e => { setQuery(e.target.value); setError(''); }} placeholder="For eksempel kylling" aria-invalid={!!error} aria-describedby={error ? 'search-error' : 'search-hint'}/><button className="button button-primary" type="submit">Finn middag <ArrowRight size={18}/></button></div><p id={error ? 'search-error' : 'search-hint'} className={error ? 'form-error' : 'field-hint'} role={error ? 'alert' : undefined}>{error || 'Søk på én råvare. Vi hjelper også med vanlige skrivefeil.'}</p></form><div className="quick-ingredients"><span>Eller prøv:</span>{['kylling','kjøttdeig','laks','pasta','egg','poteter'].map(i => <button key={i} onClick={() => search(undefined,i)}>{i}<ArrowUpRight size={14}/></button>)}</div></div></section>}
    {results !== null && <section className="results-section" aria-labelledby="results-heading"><div className="results-heading"><div><p className="eyebrow">{single ? 'MIDDAGSVALGET ER TATT' : mode === 'instant' ? 'LITT MINDRE Å TENKE PÅ' : 'DINE MIDDAGSFORSLAG'}</p><h2 id="results-heading" ref={resultHeading} tabIndex={-1}>{resultTitle}</h2></div>{results.length > 0 && !single && <span className="result-count">{results.length} forslag. Du velger.</span>}</div>
      <div className="result-context" aria-live="polite">{corrected && ingredient && <p>Vi tolket «{searched}» som {ingredient}. <button className="inline-link" onClick={() => open('ingredient')}>Endre søket</button></p>}{mode === 'guided' && <p>{applied.time === 'all' ? 'Ingen tidsgrense' : `Maks ${applied.time} min`} · {({all:'Alle typer',familie:'Familievennlig',kjott:'Kjøtt',fisk:'Fisk',vegetar:'Vegetarisk',lett:'Noe lett'} as Record<string,string>)[applied.type]} · {applied.price === 'all' ? 'Alle prisnivåer' : applied.price === 'billig' ? 'Rimelig' : 'Vanlig eller rimelig'}</p>}{notice && <p>{notice}</p>}</div>
      {results.length > 0 ? <><div className={`meal-grid ${single ? 'single-result' : ''}`}>{results.map((meal,index) => <article key={meal.id} className={`meal-card category-${meal.category}`}><div className="card-top"><span>{categoryLabels[meal.category]}</span>{single ? <span className="recommended"><Check size={14}/> DEN TAR VI</span> : <span className="card-number">0{index+1}</span>}</div><div className="card-content"><h3>{meal.title}</h3><p>{meal.shortDescription}</p><div className="meal-meta"><span><Clock3 size={16}/>{meal.timeMinutes} min</span><span>{costLabels[meal.costTier]}</span></div>{mode !== 'instant' && <p className="match-reason">{reason(meal,applied,ingredient)}</p>}</div><Link prefetch={false} href={`/middag/${meal.slug}`} className="meal-choose" onClick={() => track('meal_selected',{meal_id:meal.id,mode:mode??'instant'})}>{single ? 'Ja, vis meg oppskriften' : 'Velg denne'}<ArrowRight size={18}/></Link></article>)}</div>
      {pool.length < 3 && <p className="small-note">Vi fant {pool.length === 1 ? 'bare én rett' : 'bare to retter'} med disse ønskene. Endre {mode === 'ingredient' ? 'ingrediensen' : 'valgene'} for flere forslag.</p>}
      <div className="result-actions">{pool.length > 3 ? <button className="button button-secondary" onClick={refresh}><RotateCw size={18}/>{single ? 'Vis tre forslag igjen' : 'Vis tre nye'}</button> : single && pool.length > 1 ? <button className="button button-secondary" onClick={() => { setResults(suggest(pool,round)); setSingle(false); focusResults(); }}>Vis alternativene</button> : null}{!single && results.length > 1 && <button className="text-button" onClick={decide}>Bare bestem for meg <ArrowRight size={17}/></button>}{mode !== 'instant' && <button className="text-button" onClick={() => open(mode ?? 'guided')}>Endre {mode === 'ingredient' ? 'ingrediensen' : 'valgene'}</button>}</div></> : <Empty className="no-results"><EmptyHeader><Utensils size={30}/><EmptyTitle>{mode === 'ingredient' ? `Ingen treff på «${searched}» ennå.` : 'Prøv litt mer tid eller en annen type.'}</EmptyTitle><EmptyDescription>{mode === 'ingredient' ? 'Vi har et lite utvalg middager. Prøv en annen råvare, eller få tre tips uten ingrediensvalg.' : 'Vi beholder ønskene dine. Du bestemmer om du vil endre dem.'}</EmptyDescription></EmptyHeader><EmptyContent><button className="button button-primary" onClick={() => open(mode??'guided')}>{mode === 'ingredient' ? 'Prøv en annen ingrediens' : 'Endre valgene'}<ArrowRight size={18}/></button><button className="text-button" onClick={instant}>Gi meg tre tips uten filtre</button></EmptyContent></Empty>}
    </section>}
    {!compact && <section className="everyday-note"><div className="note-heading"><span className="note-symbol">16:20</span><h2>Mindre leting.<br/><em>Mer middag.</em></h2></div><p>Vanlige råvarer. Middager det går an å lage.<br/>Vi hjelper deg fra «aner ikke» til «den tar vi».</p><Link href="/slik-velger-vi">Slik velger vi forslagene <ArrowUpRight size={17}/></Link></section>}
    {compact && <p className="method-link">Forslag fra vårt lille middagsutvalg. <Link href="/slik-velger-vi">Slik velger vi</Link></p>}
    <noscript><p>Slå på JavaScript for å få forslag, eller gå rett til <a href="/middag/laks-med-poteter">laks med poteter</a>.</p></noscript>
  </>;
}
