> Historisk status før implementeringssprint 01. Gjeldende endringer og kontroller: [Sprint 01](sprint-01.md).

# Samlet kvalitetssjekk – 28. september 2026

## Verifisert

| Område | Kontroll og resultat |
|---|---|
| Bygg | Next.js statisk produksjonsbygg og TypeScript passerer. 42 middagsruter genereres fra samme datasett. |
| Data | 42 unike og komplette poster: 20 vegetar, 10 fisk, 12 kjøtt. 9 retter på maks 15 minutter, 33 på maks 30. |
| Motor | 9 testgrupper passerer, inkludert 63 filterkombinasjoner, deterministiske frø, variasjon, ingen duplikater og ingen stille utvidelse av grenser. |
| Direktetips | Nettlesertest: ett trykk gir tre retter. Neste runde skifter ut dem når kandidatene tillater det. Ett hovedforslag kan fremheves. |
| Veiviser | Nettlesertest: maks 15 min + vegetar gir bare passende retter. Maks 15 min + kjøtt gir tomtilstand. Maks 15 min + fisk + rimelig gir to reelle treff. |
| Ingrediens | Nettlesertest: `kyling` rettes synlig til kylling. `sjokolade` gir null, `avokado` ett og `eple` to treff. Tomt felt viser forklarende feil og beholder fokus. |
| Oppskrift | Valgt rett åpnes; porsjonene kan endres. 18 oppskriftsinstruksjoner er rettet fra faste mengder/antall til relative formuleringer. Tidsestimat skaleres ikke automatisk. |
| Responsivitet | Forside og oppskrift kontrollert ved 320, 375, 390, 768 og 1440 px. Ingen horisontal overflyt målt. Primærknappens underkant ligger under 410 px ved de tre mobile breddene. Mobil hovedreise er gjennomført ved 390 × 844. |
| Tastatur | Tab fra toppen når hovedhandlingen; Enter gir resultater og fokus flyttes til resultatoverskriften. Neste Tab når en rett, Enter åpner oppskrift. Synlig 3 px fokusmarkering bekreftet. |
| Kontrast | Plomme/papir: 12,97:1. Plomme/gul: 9,43:1. Sekundærtekst/papir: 5,43:1. Sekundærtekst/skjemaflate: 4,89:1. Fokus/papir: 6,37:1. Dette er tokenmåling, ikke en full tilgjengelighetssertifisering. |
| Personvern | Analyseadapter er avslått; testet at hendelser er stille før samtykke og etter tilbaketrekking. Appen har ingen lagring av søk/preferanser, innlogging eller eksterne fontkall. |
| Kommersielt | Ingen annonser eller partnerlenker i hovedproduktet. Fremtidsprøven finnes separat på `/prototype/`, med deaktivert eksempelknapp. |

## Rettet under gjennomgangen

- Mengdene i ingredienslisten og oppskriftsstegene var ikke konsistente ved endret porsjonsantall. Faste mengder i steg er gjort relative.
- Ved de siste én–to usette rettene ga omvalg feil beskjed om at alt var sett. Meldingen og historikken er korrigert.
- Synonymer for gulrøtter, tomater, linser, halloumi, feta og pesto er koblet til datasettets faktiske navn.
- Lakserettens tilbehør er tilpasset brokkoli for å samsvare med illustrasjonen.
- En manglende avstand mellom setninger i mobilteksten er rettet.
- Sekundærtekst på skjemaflaten var rett under 4,5:1; kontrasten er økt til 4,89:1.

## Før offentlig v1

Oppskriftene er forfattede utkast, ikke koketestet. Beregnede tider, råvaremengder og prismarkeringer må gjennomgås matfaglig. En faktisk brukerundersøkelse må teste om nye brukere forstår produktet innen fem sekunder og kommer til et middagsvalg. Ingen slik effekt er dokumentert nå.

Test på fysiske iOS-/Android-enheter og med skjermleser gjenstår. Forsøket på 200 % nettleserzoom endret ikke zoomnivået i forhåndsvisningsverktøyet og rapporteres derfor ikke som bestått. Dette må sjekkes i en ordinær nettleser før offentlig lansering. Redusert bevegelse er implementert i CSS; ikke testet med en faktisk systeminnstilling.

Ingen Lighthouse- eller feltytelsesmåling er utført. Prototypen bruker lokal logikk, statiske sider, systemfonter og ett komprimert bilde, men disse valgene er ikke dokumentasjon på reelle Core Web Vitals.

Avklar endelig personverntekst og drift, aktiver produksjonsdomene og ønsket indeksering. Rich-results krever representative rettsbilder; bare én rett har bilde nå. GA4, samtykkegrensesnitt og kommersielle integrasjoner er bevisst ikke aktivert.

## Samlet beslutning

Produkt, UX, design, data, innhold, SEO og kommersielle rammer er samlet i én prototype. Hovedreisen fungerer uten betalt AI eller backend. Prototypen er egnet for produktvurdering og brukertest; den er ikke en ferdig kvalitetssikret oppskriftslansering.
