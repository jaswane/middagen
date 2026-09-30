'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { type ConsentChoice, consentOpenEvent, initAnalytics, openConsentSettings, readConsent, setAnalyticsConsent } from '@/lib/analytics';

export function AnalyticsConsent() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ConsentChoice | null>(null);
  const banner = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const focusOnOpen = useRef(false);
  useEffect(() => {
    // Rendered only after hydration, so the static HTML never differs from the first client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!initAnalytics()) setOpen(true);
    function reopen() {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setCurrent(readConsent());
      // Opened on request: move focus to the choice. Opened on a first visit: leave focus alone.
      if (heading.current) heading.current.focus(); else focusOnOpen.current = true;
      setOpen(true);
    }
    window.addEventListener(consentOpenEvent, reopen);
    return () => window.removeEventListener(consentOpenEvent, reopen);
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement, element = banner.current;
    if (!open || !element) return;
    if (focusOnOpen.current) { heading.current?.focus(); focusOnOpen.current = false; }
    // Reserve room below the footer, so the banner never hides the end of the page.
    const reserve = () => root.style.setProperty('--consent-space', `${element.offsetHeight + 16}px`);
    reserve();
    const observer = new ResizeObserver(reserve);
    observer.observe(element);
    return () => { observer.disconnect(); root.style.removeProperty('--consent-space'); };
  }, [open]);
  function choose(choice: ConsentChoice) {
    setAnalyticsConsent(choice);
    setOpen(false);
    opener.current?.focus();
    opener.current = null;
  }
  if (!open) return null;
  return <section ref={banner} className="consent-banner" aria-labelledby="consent-title">
    <div className="consent-copy">
      <h2 id="consent-title" ref={heading} tabIndex={-1}>Kan vi måle bruken?</h2>
      <p>Vi bruker Google Analytics for å se hvilke funksjoner som faktisk blir brukt og forbedre Middagen.no. Analyse aktiveres bare hvis du sier ja. <Link href="/personvern">Les mer</Link></p>
      {current && <p className="consent-current">Nå: {current === 'accepted' ? 'analyse er tillatt' : 'kun nødvendige'}.</p>}
    </div>
    <div className="consent-actions">
      <button type="button" className="button consent-button" onClick={() => choose('accepted')}>Tillat analyse</button>
      <button type="button" className="button consent-button" onClick={() => choose('rejected')}>Kun nødvendige</button>
    </div>
  </section>;
}

export function ConsentSettingsButton({ className }: { className?: string }) {
  return <button type="button" className={className ?? 'inline-link'} onClick={openConsentSettings}>Endre analysevalg</button>;
}
