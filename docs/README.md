# Middagen.no – drift og dokumentasjon

Middagen.no er i offentlig produksjon på https://middagen.no. Nettstedet er en statisk eksport fra Next.js 16, React og TypeScript, driftet på Vercel. Det har 62 middager, ingen database, ingen innlogging og ingen betalt AI. Google Analytics 4 brukes bare etter aktivt samtykke.

## Innhold og datakilde

- `../lib/meals.json` er eneste datakilde. Den gir middagsvelgeren, oppskriftssidene, /middager/, sitemapen og Recipe-schemaet.
- 62 middager: 20 kjøtt, 16 fisk og 26 vegetar. De første 42 ble lagt inn før lansering, de 20 siste i Sprint 03A.
- Oppskriftene er gjennomgått redaksjonelt for ingredienser, mengder, rekkefølge, tid og utstyr. De er ikke koketestet eller matfaglig vurdert. Tid og prisnivå er anslag, og nettstedet sier dette på /om/ og /slik-velger-vi/.
- 62 KI-genererte matillustrasjoner ligger som 124 WebP-filer (960×640 og 480×320) i `../public/images/meals/`. Proveniens, varianter og kontrollsummer står i `image-manifest.json`, promptene i `image-prompts.md`.
- `../lib/types.ts` er datakontrakten. `../lib/engine.ts` og `../lib/ingredients.ts` står for filtre, ingredienssøk og reproduserbar rangering; `../lib/decision.ts` for forslagshistorikk og tilbakeflyt.

## Sider

- `/`: middagsvelgeren (direktetips, veiviser og ingredienssøk).
- `/middager/`: alle middagene som vanlige lenker, gruppert etter kjøtt, fisk og vegetar. Siden gjør oppskriftene crawlbare uten å gå via sitemapen eller de dynamiske forslagene. Lenket fra footeren og fra bunnen av hver oppskrift.
- `/middag/[slug]/`: én side per middag, med porsjonsjustering og Recipe-schema.
- `/om/`, `/slik-velger-vi/`, `/personvern/`, `/kontakt/`.
- `/prototype/` er fjernet og svarer 404.

`kontakt@swanecreative.no` står bare på /kontakt/. Footeren krediterer «Et prosjekt fra Swane Creative» med lenke til https://swanecreative.no/.

## SEO og domener

- Eneste canonical host er https://middagen.no (`../lib/site.ts`). Alle offentlige sider er indekserbare og peker til seg selv.
- `robots.txt` tillater crawling og peker til `https://middagen.no/sitemap.xml`.
- `../app/sitemap.ts` lister /, /middager/, /om/, /slik-velger-vi/ og alle middagssidene fra `meals.json`, i dag 66 URL-er. /personvern/ og /kontakt/ er indekserbare, men står ikke i sitemapen. Ingen `lastmod`, fordi det ikke finnes en pålitelig dato per side.
- www.middagen.no og middagen-gamma.vercel.app redirecter med 308 til apex. Begge er domeneinnstillinger i Vercel-prosjektet. `vercel.json` brukes ikke, fordi Vercel ikke leser redirects derfra for dette Next.js-prosjektet.

## Analyse og samtykke

`../lib/analytics.ts` laster GA4 (G-RB2YJ9DF6M) bare etter «Tillat analyse», og bare på https://middagen.no. Consent Mode v2 starter med alt avslått; bare `analytics_storage` gis. Google-signaler og annonsepersonalisering er av. Produkthendelsene er typede, og rå søketekst sendes aldri. Sidevisninger ved navigering sendes av appen, fordi GA4s historikkbaserte sidevisninger ikke fanget dem opp. Valget kan endres via «Endre analysevalg» i footeren og på /personvern/.

## Kjøring

Krever Node 22.13+ og npm.

```sh
npm ci
npm run dev
```

Lokal adresse er `http://127.0.0.1:5173`. `npm run build` lager den statiske eksporten i `out/`; den må serveres av en statisk webserver, ikke åpnes som `file://`.

## Tester

```sh
npx tsc --noEmit
npm run lint
npm run build                     # kjører scripts/check-content.mjs først
node scripts/check-product.mjs    # data, filtre, søk, variasjon
node scripts/check-sprint.mjs     # søk, tilbakeflyt, porsjoner, beslutningshistorikk
node scripts/check-sprint03a.mjs  # de 20 nye middagene, gamle 42 uendret
node scripts/check-export.mjs     # oppskriftssidene i out/
node scripts/check-launch.mjs     # canonical, robots, sitemap, /middager/-lenker, footer/kontakt
node scripts/check-analytics.mjs  # samtykke, GA-lasting, hendelser, vertsbegrensning
node scripts/check-live.mjs       # produksjon etter deploy (bruker nettverk)
```

## Kjente begrensninger

- På Windows skriver Next 16.3.4 prefetch-filene for /om/, /slik-velger-vi/, /personvern/ og /kontakt/ til en undermappe i stedet for som flatfil (`path.relative` gir `\`). En lokal statisk server svarer derfor 404 på disse prefetch-kallene. Vercel bygger på Linux, og produksjonen svarer 200.
- Søket «fisk» gir ingen treff; søket virker på konkrete råvarer.
- Koketesting og matfaglig gjennomgang av oppskriftene gjenstår.

## Historikk

- `produktstrategi.md`: opprinnelig produktvurdering.
- `qa.md`, `sprint-01.md`, `sprint-02.md`, `recipe-qa-sprint-02.md`: kontroller og endringer fra prototypefasen før lansering. De beskriver ikke dagens produksjon.
- `sprint-03a.md`: de 20 nye middagene og release-auditen.
