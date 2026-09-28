# Middagen.no – leveranse

En fungerende produktprototype i Next.js 16, React og TypeScript. Statisk eksport, 42 oppskriftsutkast, ingen database, innlogging, betalt AI eller aktiv sporing.

## Start her

- `produktstrategi.md`: samlet vurdering og leveransene A–M.
- `qa.md`: hva som faktisk er kontrollert, og hva som gjenstår før offentlig lansering.
- `sprint-02.md`: bilder, redaksjonell QA og testresultater for den fryste testprototypen.
- `image-manifest.json`: proveniens, varianter og kontrollsummer for alle 42 matbilder.
- `recipe-qa-sprint-02.md`: gjennomgang og endringer per oppskrift.
- `/prototype/`: designprøver for søstermerke, fremtidig kommersiell boks og lasting. Utelatt fra produktets navigasjon og sitemap.
- `../lib/types.ts`: implementert datakontrakt.
- `../lib/meals.json`: eneste datakilde for appen.
- `../lib/engine.ts`: normalisering, filtre og reproduserbar rangering.

## Kjøring

Krever Node 22.13+ og npm. Kjør fra prosjektmappen:

```sh
npm ci
npm run dev
```

Lokal adresse er `http://127.0.0.1:5173`. Alternativt kan Next kjøres direkte med `node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 5173`.

```sh
node scripts/check-product.mjs
node scripts/check-sprint.mjs
node scripts/check-content.mjs
npx tsc --noEmit
npm run lint
npm run build
node scripts/check-export.mjs
```

Bygget ligger i `out/`. Server hele denne mappen med en statisk webserver; ikke åpne HTML som `file://`. Ingen Node-server trengs i drift.

Prototypen bruker `noindex` og en tom sitemap. Før offentlig lansering: gjennomgå oppskrifter og personvern, sett faktisk produksjonsdomene i metadata og schema, slå på ønsket indeksering, og aktiver produksjonssitemap. `scripts/production-sitemap.mjs` lager et forslag med de 47 planlagte offentlige rutene; dette er ikke aktivert automatisk.

## Arkitektur og avgrensninger

Serverkomponenter lager sidene. Forsideklienten mottar bare kortdata; oppskriftsinstruksjonene sendes ikke som del av velgerens datasett. Filtrering skjer før variasjon. Samme kandidater og frø gir samme forslag. Beslutningen og visningshistorikken bevares midlertidig i sessionStorage for samme nettleserfane, med minne som reserve når lagring er blokkert.

`analytics.ts` er en avslått adapter. Den gjør ingen nettverkskall. Eventuell GA4 krever faktisk samtykkeflyt og handler før aktivering. Rå søketekst sendes aldri gjennom hendelseskallene.

42 originale KI-lagde matillustrasjoner er komprimert til 84 WebP-filer i 960×640 og 480×320. Next/Image velger lokale varianter uten bildeserver. `npm run build` kontrollerer data, filer og kontrollsummer før bygging. Ingen eksterne fontkall. Ingen partneravtaler eller annonser er implementert.

Next.js ble valgt fremfor starterens Vinext-kjøring for å levere den etterspurte Next.js-eksporten. Eksisterende komponentprimitiver er gjenbrukt for native selects og tom-/lastetilstander. Starterens ubrukte biblioteker lastes ikke av applikasjonen.
