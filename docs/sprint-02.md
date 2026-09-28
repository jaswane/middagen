# Sprint 02 – presentasjon, bilder og innhold

Dato: 29. september 2026. Grunnlag: Sprint 01, commit `2e9948cb56d2d063add0657fb7ae4cb75a94a6cc`.

## 1. Oppsummering

42 eksisterende middager har egne bilder, konkrete beskrivelser og gjennomgåtte oppskrifter. Bildene er små i mobilkortene og større i enkeltvalget. Resultatoverskriften får fokus og rulles inn på både mobil og desktop, slik at bildene ikke gjemmer navn og handling under første skjerm. Prototypen skal fryses etter privat release; neste arbeid er den planlagte førstegangsbrukertesten.

## 2. Filer

- `lib/meals.json`, `lib/types.ts`: innhold, bildeinformasjon og visningstags.
- `components/meal-image.tsx`, `lib/image-loader.ts`, `next.config.ts`: Next/Image med ferdige lokale WebP-varianter.
- `components/dinner-picker.tsx`, `app/middag/[slug]/page.tsx`, `app/globals.css`: kort, enkeltvalg og oppskriftspresentasjon.
- `app/page.tsx`, `scripts/check-sprint.mjs`: presise lint-kommentarer for utelatte oppskriftsfelt. State-restaurering og hendelseslagring er beholdt, med begrunnede, lokale lint-unntak i velgeren.
- `app/om/page.tsx`: «matbildet» korrigert til flertall.
- `public/images/meals/`: 84 WebP-filer.
- `docs/image-manifest.json`, `docs/image-prompts.md`, `docs/recipe-qa-sprint-02.md`, denne rapporten og oppdatert `docs/README.md`.
- `scripts/check-content.mjs`, `scripts/check-export.mjs`, `package.json`: automatiske kontroller og obligatorisk kontroll før bygg.

Ingen nye avhengigheter eller endret lockfil.

## 3–5. Bildekonsept, antall og proveniens

42 originale motiver, hvert generert separat for sin oppskrift. Omtrent 45 graders vinkel, mykt dagslys, enkel lys keramikk og rolig bordflate. Hverdagslig servering, uten tekst, logoer, mennesker eller overdrevet styling. Alle er visuelt kontrollert mot ingredienser og fremgangsmåte, også samlet i kontaktark.

84 publiseringsfiler: 960×640 og 480×320, samme 3:2-utsnitt. PNG-originalene er beholdt i arbeidsområdets `../review/sprint-02-images/` og inngår ikke i appen.

Manifestet oppgir `mealId`, fil, genereringskilde/proveniens, klassifisering `generated`, dato, notater, alt-tekst, variantdimensjoner, filstørrelser og SHA-256. Eksakte prompter er dokumentert. Ingen fotografier er hentet fra andre nettsteder. KI-bildene er illustrasjoner, ikke dokumentasjon av koketesting; dette står på oppskriftssidene.

## 6–7. Kort og datamodell

Kort: bilde, navn, én konkret setning, cirka tid, relativt prisnivå, 0–2 relevante egenskaper og «Se oppskriften». Viktige tidsforutsetninger beholdes. Generisk vanskelighetsgrad, nummerering og gjentakende motorbegrunnelser vises ikke.

Nye påkrevde felt: `image { src, alt, width, height }` og `displayTags[]`. Tillatte visningstags: vegetar, fisk, ovnsrett, én panne, én gryte og uten koking. De velges eksplisitt; interne motor-tags eksponeres ikke automatisk. «Én panne/gryte» brukes bare der utstyr og oppskrift støtter det. Utstyr vises på oppskriften. Ingen separate felt for aktiv tid, basisvareløfter eller CMS er lagt til.

## 8–9. Redaksjonell QA og korreksjoner

Alle 42 er gjennomgått mot ingrediensbruk, enheter, rekkefølge, varme, tid, utstyr, skalering og naturlig norsk. Full gjennomgang per rett finnes i [recipe-qa-sprint-02.md](recipe-qa-sprint-02.md).

Tidsendringer:

| Rett | Før → nå |
|---|---|
| Kyllingwok | 30 → 35 min |
| Pølsepanne med poteter | 30 → 35 min |
| Kjøttboller i tomatsaus | 35 → 40 min |
| Egg- og potetpanne | 30 → 35 min |
| Tomatsuppe | 25 → 30 min |
| Bønnewraps | 15 → 20 min |
| Rød linsesuppe | 30 → 35 min |
| Spinatlasagne | 55 → 60 min |
| Potet- og purresuppe | 35 → 40 min |
| Grønnsakspizza | 30 → 35 min |
| Ost- og bønnequesadillas | 15 → 20 min |
| Bakt søtpotet | 55 → 60 min |

Torsk i tomatsaus, ovnstorsk og pannestekt torsk er endret fra «vanlig» til «litt ekstra». Klassifiseringen er relativ, uten butikkprisoppslag. Fryst fisk/tilbud, avokado, halloumi, ost og pølsetype er prisusikkerheter. Ingen kroner per porsjon.

Alle 42 kortbeskrivelser er konkretisert. «Grønnsakspizza med ferdig bunn» heter nå «…med ferdig deig», med samme slug. Bønner/kikerter er presisert som ferdigkokte og avrente, og buljongmengder som ferdigblandede. Varme, bruk av krydder, parallell tilberedning og manglende utstyr er rettet der nødvendig. Ingen ingrediensmengder eller grunnporsjoner er endret.

## 10. Tester

- TypeScript: bestått, både separat og i produksjonsbygg.
- ESLint: bestått uten feil eller advarsler.
- `check-product.mjs`: 9 grupper bestått.
- `check-sprint.mjs`: 16 grupper bestått, inkludert søk, former, state/Back, variasjon, porsjoner og 36 nåværende filterkombinasjoner.
- `check-content.mjs`: alle 42 poster og 84 bildefiler bestått. Sjekker beskrivelser, slugs, alt, tid, pris, ingredienser, trinn, tags, dimensjoner, filer og manifest/kontrollsummer. Kjøres automatisk før `npm run build`.
- Negativ test: én bildefil ble midlertidig flyttet. Prebuild stoppet med konkret fil/meal-ID; filen ble gjenopprettet og kontrollen bestod.
- Produksjonsbygg: 52 statiske sider, inkludert 42 oppskrifter. Windows krevde tillatelse til Nexts underprosesser utenfor sandbox; samme byggkommando bestod der.
- `check-export.mjs`: alle 42 eksporterte oppskrifter har begge bildevarianter, dimensjoner, Recipe-schema, trinn og fortsatt `noindex`.
- `git diff --check`: bestått.
- Alle 36 kombinasjoner også prøvd i UI: 3 nulltreff (15 min/kjøtt), 6 kombinasjoner med to forslag, resten med tre. Ingen skjult lemping av filtre.

## 11. Responsiv kontroll

Alle sju bredder ble kontrollert med landing, tre forslag, tre nye, enkeltvalg/angre, ingrediensresultat, filterresultat, nulltreff og seks oppskrifter: kyllingwok, laks med poteter, tomatsuppe, spinatlasagne, quesadillas og bakt søtpotet. Dette dekker kjøtt, fisk og vegetar, korte og lengre titler, utstyrsnotater og tidsforutsetninger.

| Viewport | Første direktekort etter klikk, omtrent | Start ingrediensdel i seks oppskrifter, omtrent | Resultat |
|---|---|---|---|
| 320 | 226 px | 482–567 px | Ingen horisontal overflyt |
| 375 | 183 px | 481–550 px | Ingen horisontal overflyt |
| 390 | 184 px | 481–550 px | Ingen horisontal overflyt |
| 430 | 184 px | 460–529 px | Ingen horisontal overflyt |
| 1280 | 179 px etter desktop-rettingen | 554 px | Tre samlet, alle handlinger synlige i prøven |
| 1440 | 179 px | 554 px | Tre samlet, alle handlinger synlige i prøven |
| 1920 | 179 px | 554 px | Innholdets maks-bredde beholdt |

Tallene er observerte layoutkoordinater i nettleseren, ikke brukertestresultater. Viewport-høyde 844 px. Nettleserens vanlige rullefelt opptar inntil 15 px av innholdsbredden. Titler, merknader og knappebrekk gir noe variasjon. Hele mobil- og desktopløpet ble også kjørt mot den statiske produksjonseksporten ved 390 og 1440 px.

Resultatoverskrift får fokus. Neste Tab går til første beslutningshandling, med synlig 3 px fokusramme. Tomt søk gir melding og fokus i feltet. Kort-CTA er minst 48 px høy, beslutningshandlinger minst 44 px og porsjonsknapper 44×44 px. Porsjonsendring i UI og retur/angre er kontrollert. Ingen feil eller advarsler i konsollen i de endelige testløpene.

## 12. Bildeytelse

Alle 84 varianter veier samlet 4 294 148 byte (ca. 4,29 MB). En 480-variant veier 12–32 kB, i snitt 25 kB; 960-varianten 42–103 kB, i snitt 78 kB. Siden laster aktuelle bilder, ikke hele bildeutvalget. Next/Image bruker `sizes` og to lokale `srcset`-kandidater; mobilkort valgte 480-filen i kontrollen. Første kort/hovedbilde lastes prioritert, øvrige kort bruker lazy loading. Ingen original-PNG-er i produksjonen.

Bildene reserverer plass med korrekte dimensjoner og 3:2-format. Ingen observerte bildedrevne layouthopp, feil utsnitt eller ødelagte synlige bilder i kontrollene. Numerisk CLS, LCP, nettverk under struping og feltytelse er ikke målt; dette er filkontroll og visuell/DOM-basert QA.

## 13. Bevaring

Motor, aliaser, ingrediensfamilier, råvareformer, state-serialisering, sessionStorage, Back og porsjonsavrunding er uendret. Tids-/priskorrigeringene endrer naturlig hvilke retter som kvalifiserer for et filter: nå 6 retter ≤15 min og 27 ≤30 min. Variasjons- og state-testene består med disse dataene. Ruteantall, slugs, private indekseringsinnstillinger og 42-retters omfang er bevart.

Papirbakgrunn, plomme, serif, gul aksent, tynne linjer og begrenset radius er beholdt. Ingen nye funksjoner, filtre, kommersielle lenker, annonser, analytics eller trackingstubber er lagt til. Den allerede eksisterende, avslåtte analyseadapteren er urørt.

## 14. Restpunkter

WRITING.md ble ikke funnet i undersøkte prosjektkilder, arbeidsområde eller vedlegg. Den er ikke rekonstruert; CLAUDE.md peker fortsatt på eksisterende AGENTS.md. Tekstene er gjennomgått etter brukerens eksplisitte prinsipper om konkret og naturlig språk.

Koketesting, matfaglig gjennomgang før offentlig lansering, fysiske iOS-/Android-enheter, skjermlesertest og målte Core Web Vitals gjenstår. Privat førstegangsbrukertest skal nå avklare beslutningshastighet, relevans og gjenbruksvilje. Ingen nye funksjoner foreslås før testdata finnes.

## 15. Git og privat release

Kilde, dokumentasjon og bildeassets leveres i samme versjon. Byggkontrollene over gjelder produksjonsarkivet som publiseres til eksisterende owner-private Site; tilgangsnivået skal beholdes. Endelig commit, deploy-status og URL oppgis i overleveringen. Prototypen fryses etter bekreftet privat release.

Lokale skjermbilder og måleresultater: `../review/sprint-02-ui/` relativt til repo-roten. Bildemanifest og oppskrifts-QA er del av Git-versjonen; originalbilder og testbevis ligger i arbeidsområdet utenfor publiseringsmappen.
