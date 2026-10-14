Middagen.no – Sprint 03A, sluttrapport før commit

Gjennomført 14.–15. oktober 2026 i C:/_Nettsider/middagen. Claude Code var stoppet etter brukerens bekreftelse. Utgangspunkt: clean main, HEAD d7c4ab45ec99ff0cfd59605a88b00076ad1116b7, origin https://github.com/jaswane/middagen.git.

20 nye middager og 20 egne bilder er ferdige lokalt. De eksisterende 42 oppskriftene og deres bildemanifest er uendret. Alle pålagte kommandoer for typekontroll, lint, bygg, produkt-, sprint-, innholds-, eksport-, launch- og analytics-tester består. Responsiv funksjonskontroll består, men en separat nettverkssjekk fant 404 ved forhåndslasting av informasjonssider fra Windows-eksporten. Hele nettleser-/nettverkssjekken er derfor ikke grønn. Se punkt 15. Ingen commit, push eller deploy er gjort.

**1. Endelig liste over 20 nye middager**

| Middag | Kategori | Minutter | Pris |
| --- | --- | --- | --- |
| Kjøttdeig med couscous og agurk | Kjøtt | 20 | Vanlig |
| Pølse- og bønnegryte med brød | Kjøtt | 15 | Rimelig |
| Kylling med sopp og ris | Kjøtt | 30 | Vanlig |
| Pølser i lompe med kålsalat | Kjøtt | 15 | Rimelig |
| Karbonader med potetmos og erter | Kjøtt | 25 | Vanlig |
| Pita med ferdigstekt kylling og kål | Kjøtt | 20 | Vanlig |
| Kylling- og nudelsuppe | Kjøtt | 25 | Vanlig |
| Kylling og ris i én gryte | Kjøtt | 30 | Vanlig |
| Fiskepinner med potetmos og erter | Fisk | 25 | Rimelig |
| Seibiff med løk og poteter | Fisk | 30 | Rimelig |
| Fiskeburger med kålsalat | Fisk | 15 | Vanlig |
| Fiskegrateng med sei og makaroni | Fisk | 60 | Rimelig |
| Fiskesuppe med sei, potet og gulrot | Fisk | 30 | Rimelig |
| Fiskeboller i hvit saus med gulrot og poteter | Fisk | 30 | Rimelig |
| Pannekaker med spinat og cottage cheese | Vegetar | 35 | Rimelig |
| Linsegryte med sopp og poteter | Vegetar | 35 | Rimelig |
| Tomat- og bønnepasta | Vegetar | 20 | Rimelig |
| Kikertpanne med brokkoli og egg | Vegetar | 25 | Rimelig |
| Potet- og blomkålgrateng med hvite bønner | Vegetar | 50 | Rimelig |
| Grønn ertesuppe med brød | Vegetar | 20 | Rimelig |

16 av de nye rettene tar høyst 30 minutter. To nye ovnsretter får henholdsvis 50 og 60 minutter; de brukes ikke av den eksisterende direkteknappen, som setter grensen ved 45 minutter. Utvalget er vurdert mot dagens 42 og middagssituasjonen kl. 16:20, ikke sortert etter de få GSC-visningene.

**2. De fem tidligere tvilstilfellene**

| Tidligere kandidat | Beslutning | Hvorfor |
| --- | --- | --- |
| Makrell i tomat med eggerøre og grovt brød | Erstattet med fiskegrateng med sei og makaroni | Tydelig varm middag; rimelig fisk og en egen ovnsform. Ikke laget som en 15-minuttersrett. |
| Eggerøre med spinat, tomat og grovt brød | Erstattet med pannekaker med spinat og cottage cheese | Egg er en sentral råvare i en mettende middag med fyll; mer forskjellig fra eksisterende omeletter. |
| Karbonadesmørbrød med stekt løk | Erstattet med karbonader med potetmos og erter | Beholder raske ferdige karbonader, men setter dem i en tydelig middagsservering. |
| Pastasalat med skinke og erter | Erstattet med kylling med sopp og ris | Prioriterer det dokumenterte hullet for rå kylling innen 30 minutter og bedre soppdekning. |
| Linsesalat med rødbeter, feta og brød | Erstattet med linsegryte med sopp og poteter | Varm, fullverdig middagsform og konkrete ferdigkokte grønne linser. |

Ingen av disse var publiserte oppskrifter som er slettet. Det er kandidater i planen som er revidert. Den tidligere brokkoli-/kikertretten med couscous er også dreid til kikertpanne med brokkoli og egg for å skille den bedre fra eksisterende couscous med kikerter. Pølser i lompe er beholdt som en vanlig rask middag, med kålsalat og tydelige forutsetninger; det er fortsatt en enkel middagstype, ikke et løfte om å passe alle brukere.

**3. Kategorifordeling**

| Kategori | Før | Nye | Etter |
| --- | --- | --- | --- |
| Kjøtt | 12 | 8 | 20 |
| Fisk | 10 | 6 | 16 |
| Vegetar | 20 | 6 | 26 |

**4. Tidsfordeling**

| Oppgitt tid | Før | Nye | Etter |
| --- | --- | --- | --- |
| 15 min | 6 | 3 | 9 |
| 20 min | 5 | 4 | 9 |
| 25 min | 6 | 4 | 10 |
| 30 min | 10 | 5 | 15 |
| 35 min | 9 | 2 | 11 |
| 40 min | 2 | 0 | 2 |
| 45 min | 1 | 0 | 1 |
| 50 min | 0 | 1 | 1 |
| 60 min | 3 | 1 | 4 |

Høyst 15 minutter: 6 → 9. Høyst 30 minutter: 27 → 43. Kjøtt høyst 30 minutter: 5 → 13. Rå kylling høyst 30 minutter: 0 → 3. Direkteknappens faktiske utvalg: 39 → 57 retter.

**5. Prisfordeling**

| Prisnivå | Før | Nye | Etter |
| --- | --- | --- | --- |
| Rimelig | 19 | 13 | 32 |
| Vanlig | 15 | 7 | 22 |
| Litt ekstra | 8 | 0 | 8 |

Prisnivåene er relative redaksjonelle anslag som i dagens datasett, ikke innhentede butikkpriser. Rimelig fisk øker fra 2 til 7 retter; innen 30 minutter fra 2 til 6. Fiskeburger er satt til vanlig pris, mens sei, fiskepinner og fiskeboller med enkle tilbehør er vurdert som rimelige. Kyllingfilet, ferdigstekt kylling og ferdige karbonader er vanlig pris. Ingen kronebeløp eller prisinnhenting er lagt til.

**6. Råvaredekning før og etter**

Tallene er treff fra den faktiske ingrediensmotoren uten tids- eller prisfilter, ikke fritekstforekomster i ingredienslistene.

| Søk | Før | Etter |
| --- | --- | --- |
| kylling | 3 | 6 |
| kyllingfilet | 2 | 5 |
| ferdigstekt kylling | 0 | 1 |
| kjøttdeig | 4 | 5 |
| karbonader | 0 | 1 |
| laks | 3 | 3 |
| torsk | 3 | 3 |
| sei | 0 | 3 |
| pasta | 10 | 12 |
| spaghetti | 7 | 7 |
| potet | 9 | 16 |
| egg | 7 | 9 |
| pølse | 3 | 5 |
| sopp | 3 | 5 |
| bønner | 6 | 9 |
| linser | 1 | 2 |
| grønne linser | 0 | 1 |
| kål | 0 | 3 |
| hodekål | 0 | 3 |
| ris | 8 | 10 |
| fiskepinner | 0 | 1 |
| fiskekaker | 1 | 2 |
| fiskeboller | 0 | 1 |
| vegetar | 20 | 26 |
| salat | 2 | 2 |

Alle 36 kombinasjoner i dagens veiviser har minst ett treff. De tre tidligere tomme kombinasjonene er kjøtt / 15 min med hvert av de tre prisvalgene; alle gir nå to treff. Ingen filtre lempes. 15-minuttersutvalget for kjøtt er fortsatt bare pølse- og bønnegryte samt pølser i lompe. Rimelig fisk / 15 min og rimelig vegetar / 15 min har fortsatt bare to treff. Dette er synlige begrensninger i datagrunnlaget, ikke skjulte fallback-regler.

**7. Nye ingrediensfamilier og råvareformer**

Nye verdier i mainIngredients/secondaryIngredients: lomper, kål, ferdige karbonader, ferdigstekt kylling, pitabrød, fiskepinner, sei, fiskeboller, hvetemel, linser.

Nye eksplisitte verdier i ingredientForms: middagspølser, ferdigkokte middagspølser, ferdigkokte hvite bønner, grillpølser, ferdigkokte grillpølser, hodekål, ferdigstekte karbonader, karbonader, melne poteter, ferdigstekt kyllingkjøtt, tørre eggnudler, basmatiris, frosne fiskepinner, seifilet, ferdigstekte fiskekaker, fiskeboller i kraft, fersk spinat, grønne linser, ferdigkokte grønne linser, ferdigkokte kikerter, grønne erter, frosne erter, frosne grønne erter.

Dette er eksisterende datafelter, ikke en ny aliasmotor. lib/ingredients.ts og lib/engine.ts er uendret. Eksisterende generelle søk, singular/plural og feilstavinger videreføres gjennom dagens normalisering.

Rå kyllingfilet gir ikke pita med ferdigstekt kylling. Rå kjøttdeig gir ikke ferdige karbonader. Egg og brødsmuler i fiskegratengen er bindemidler/skorpe og er ikke søkegrunnlag for «jeg har egg» eller «jeg har brød». Tørre grønne linser gir ikke treff på oppskriften som krever ferdigkokte linser. Konkrete pastaformer er avgrenset til makaroni/penne der oppskriften støtter dette; spaghettiutvalget er uendret.

**8. Bilder og proveniens**

20 separate originale genereringer med OpenAI image_gen. Ingen eksterne fotografier. Alle har 3:2-format med 960 × 640 og 480 × 320 WebP, totalt 40 nye filer på 1 870 540 byte. Hele bildesettet består nå av 124 filer på 6 164 688 byte. Alt-tekst, dimensjoner, filstørrelse, SHA-256, kilde, genereringstidspunkt og originalprompt er dokumentert i docs/image-manifest.json og docs/image-prompts.md.

Originale PNG-er er bevart lokalt i work/sprint03a/originals/. Denne arbeidsmappen er ignorert av Git og følger ikke en senere clone. De leverte WebP-ene og proveniens/prompt følger repoet. Ingen eksisterende bilder er erstattet.

Alle nye bilder er kontrollert mot oppskriften, og de samlede 62 motivene er gjennomgått i fire kontaktark. Mykt nøytralt lys, enkel keramikk og rolige bordflater er videreført. Variasjonen kommer blant annet fra klar nudelsuppe, lys fiskesuppe, grønn ertesuppe, brun linsegryte, ulike skorper og ulike håndholdte serveringer. Ingen tilfeldig persille eller ekstra tilbehør er tilsiktet/observert i de godkjente motivene. Bildene er illustrasjoner og dokumenterer ingen koketest.

**9. Redaksjonell oppskrifts-QA**

Alle 20 ingredienslister og fremgangsmåter er lest for samsvar, rekkefølge, prep, varme, mengder, tid, utstyr, servering og korttekst. Dette er redaksjonell gjennomgang, ikke fysisk koketesting eller matfaglig sertifisering. Pris og tid er fortsatt anslag.

| Middag | Avgjørende tids-/utstyrsforutsetning |
| --- | --- |
| Kjøttdeig med couscous og agurk | Bruk couscous med 5 minutters trekketid. Flere stekeomganger kan øke tiden. |
| Pølse- og bønnegryte med brød | Forutsetter ferdigkokte pølser og bønner. Kok opp under lokk. |
| Kylling med sopp og ris | Bruk tynne kyllingstrimler og ris med 12–15 minutters koketid; kok risen parallelt. |
| Pølser i lompe med kålsalat | Forutsetter ferdigkokte grillpølser og en panne med plass til pølsene i ett lag. |
| Karbonader med potetmos og erter | Bruk ferdigstekte karbonader og poteter skåret i små terninger. Rå kjøttdeig kan ikke brukes direkte. |
| Pita med ferdigstekt kylling og kål | Forutsetter ferdigstekt kylling og pitabrød som kan varmes raskt i panne. Velg en panne med plass til flere brød. |
| Kylling- og nudelsuppe | Bruk tynne kyllingstrimler og nudler med 3–4 minutters koketid. |
| Kylling og ris i én gryte | Forutsetter basmatiris med 10–12 minutters koketid og små kyllingbiter. Hviletiden er inkludert. |
| Fiskepinner med potetmos og erter | Velg fiskepinner som kan stekes i panne på 8–12 minutter. Flere omganger øker tiden. |
| Seibiff med løk og poteter | Forutsetter tint seifilet og en panne med plass til fiskestykkene i ett lag. |
| Fiskeburger med kålsalat | Forutsetter ferdigstekte fiskekaker som varmes på høyst 10 minutter. Burgerbrødene serveres uten oppvarming. |
| Fiskegrateng med sei og makaroni | Forutsetter tint sei. Bruk en form som gir omtrent samme høyde ved endret porsjonsantall. |
| Fiskesuppe med sei, potet og gulrot | Forutsetter tint sei og poteter i små terninger. |
| Fiskeboller i hvit saus med gulrot og poteter | Bruk ferdigkokte fiskeboller i kraft; oppgitt fiskemengde er uten kraft. |
| Pannekaker med spinat og cottage cheese | Tiden forutsetter to stekepanner og inkluderer 10 minutters svelling. Én panne tar lengre tid. |
| Linsegryte med sopp og poteter | Forutsetter ferdigkokte grønne linser. Tørre linser må kokes separat og gir lengre total tid. |
| Tomat- og bønnepasta | Bruk ferdigkokte bønner og pasta med 8–10 minutters koketid. Kok pasta og saus parallelt. |
| Kikertpanne med brokkoli og egg | Forutsetter ferdigkokte kikerter og en vid panne med plass til eggene. Flere porsjoner kan kreve to panner. |
| Potet- og blomkålgrateng med hvite bønner | Poteter og blomkål forkokes mens ovnen varmes. Bruk ferdigkokte bønner. |
| Grønn ertesuppe med brød | Bruk frosne grønne erter og stavmikser. Tørre gule erter kan ikke brukes direkte. |

Alle oppskrifter bruker fire basisporsjoner. Skalering for 1, 2, 3, 4, 6 og 8 porsjoner er kontrollert uten NaN/ugyldige mengder. Nettleseren er kontrollert med 4 → 3 → 2 → 4; eksempelvis 600 g kylling blir 300 g ved to porsjoner og går tilbake til 600 g. Eksisterende hjelp ved delte egg og merknaden om større panner/lengre tid videreføres.

Tørr ris, tørr pasta og avrente belgvekter skilles i tekst og datagrunnlag. 15-minuttersrettene krever ferdigkokte pølser eller ferdigstekte fiskekaker. Sei må være tint. Pannekakene krever to panner for 35-minuttersanslaget. Formhøyde og forkoking er oppgitt for gratengene. Vegetarretter med ost spesifiserer vegetarisk løpe. Rå kylling og kjøttdeig skal gjennomstekes/-kokes; generell fagreferanse brukt i gjennomgangen: [Mattilsynet – varm mat skal være rykende varm](https://www.mattilsynet.no/mat-og-drikke/matservering/mathandtering-hygiene/varm-mat-skal-vaere-rykende-varm).

SHA-256 av JSON-verdiene for de første 42 rettene er fortsatt 505074d6e764ae19d97a2e825bc6914259b1f319a7576ca440d04c82ece5004d. Det er ingen nødvendig datakollisjon eller endring i eksisterende retter.

**10. Motor og variasjon**

Motor og beslutningslag er uendret. Regresjonen kjører 50 frø per utvalg gjennom hele kandidatlisten og to runder til for de syv etterspurte utvalgene samt faktisk direkteutvalg (maks 45). Den kontrollerer unike kort, filtrert relevans, usette før sette og at forrige sett unngås når kandidatlisten er stor nok. Alle kandidatene nås. I nettleseren ble direkteknappen og fire oppfriskninger kontrollert i hver bredde: 15 ulike retter per løp. «Bare bestem» og tilbake til samme tre alternativer består.

En separat diagnostisk sammenligning bruker 50 frø × fem sett = 250 sett per utvalg, både før og etter. I de 2 000 etter-settene finnes ingen tre like primære råvarefamilier, ingen tre pasta-baser og ingen tre ris-baser etter motorens egne kategorier. Dette er en avgrenset simulering, ikke en garanti for alle fremtidige klikk eller en brukertest.

| Utvalg | Kandidater før → etter | Tre like tilberedningsgrupper før → etter, av 250 |
| --- | --- | --- |
| ingen filter | 42 → 62 | 0 → 0 |
| direkteknapp (maks 45) | 39 → 57 | 1 → 0 |
| kjøtt | 12 → 20 | 60 → 29 |
| fisk | 10 → 16 | 27 → 25 |
| vegetar | 20 → 26 | 0 → 0 |
| 15 min | 6 → 9 | 0 → 16 |
| 30 min | 27 → 43 | 18 → 0 |
| rimelig | 19 → 32 | 9 → 0 |

Kjøtt, 30 minutter og rimelig får tydelig større variasjonsrom. 15-minuttersutvalget gir noen flere sett med samme grove tilberedningsgruppe. Det er ikke automatisk tre like middager: pannegruppen kan romme fiskeburger, pølser i lompe og stekt ris. De grove metodene er avledet fra utstyr; «stavmikser» betyr for eksempel også ertepuré og er ikke en eksakt middagsform.

Et konkret gjenværende mønster i fisk, frø 17, femte sett: laks med poteter / fiskepinner med potetmos / fiskeboller med poteter. Alle har potet som base, men ulik råvare og tilberedning. Etter flere sett prioriterer motoren de gjenværende usette rettene. Dette er dokumentert som en begrensning i dagens prioritering, ikke brukt som begrunnelse for å omskrive motoren i innholdssprinten. Ingen feil i filtrering, duplikatvern eller gjenoppretting er funnet.

**11. Sitemap, canonical og Recipe**

Den eksisterende meals.json-baserte logikken gir 62 oppskriftssider og nøyaktig 65 sitemap-URL-er: 62 middager pluss /, /om/ og /slik-velger-vi/. Launchkontrollen ser 67 offentlige sider inkludert personvern og kontakt; disse to er fortsatt utelatt fra sitemap. Next-bygget viser 71 genererte oppføringer inklusive rammeverkets egne artefakter.

Canonical til https://middagen.no, indekserbarhet, robots og Recipe-schema er kontrollert. De nye sidene har bilde, totalTime, ingredienser og fremgangsmåte via den eksisterende malen. Sitemap- og SEO-logikken er uendret. Tallene gjelder den lokale eksporten; de 20 nye sidene er ikke publisert.

**12. Tester**

| Kommando/kontroll | Resultat |
| --- | --- |
| node node_modules/typescript/bin/tsc --noEmit --incremental false | Bestått |
| npm run lint | Bestått; ny sprinttest også lintet etter siste testjustering |
| npm run build | Bestått, statisk eksport |
| node scripts/check-product.mjs | 8 testgrupper bestått |
| node scripts/check-sprint.mjs | 16 testgrupper bestått |
| node scripts/check-sprint03a.mjs | 7 testgrupper bestått |
| node scripts/check-content.mjs | 62 retter / 124 bilder, dimensjoner og kontrollsummer bestått |
| node scripts/check-export.mjs | 62 oppskriftssider bestått |
| node scripts/check-launch.mjs | 8 testgrupper bestått; 65 sitemap-URL-er |
| node scripts/check-analytics.mjs | 16 testgrupper bestått |
| git diff --check | Bestått |
| Responsiv funksjon/layout | Bestått, se punkt 13 |
| Samlet nettleser-/nettverkssjekk | Ikke grønn: 64 gjentatte prefetch-404 på fire eksisterende informasjonssider, se punkt 15 |

Ingen analytics er lagt til. Ingen nye avhengigheter eller konfigurasjonsendringer. Testartefakter, kontaktark, skjermbilder og testkjøringsgrunnlag ligger lokalt i den ignorerte mappen work/sprint03a/. De følger ikke repoet. Ny varig regresjonstest er scripts/check-sprint03a.mjs og kjøres med kommandoen over.

**13. Responsiv QA**

Chrome headless med ferske nettleserkontekster mot lokal, uendret produksjonseksport på 127.0.0.1:5174. Mobilhøyde 844 px, desktophøyde 900 px, deviceScaleFactor 1. Dette er nettleseremulering, ikke fysisk iPhone-/Android-testing eller Safari-testing.

| Bredde | Layoutkontroller | Oppskriftsvisninger med porsjonskontroll | Produktforløp |
| --- | --- | --- | --- |
| 360 px | 16 | 7 | 8 |
| 390 px | 30 | 21 | 8 |
| 430 px | 16 | 7 | 8 |
| 1280 px | 16 | 7 | 8 |
| 1440 px | 16 | 7 | 8 |

Totalt 94 layoutkontroller, 49 oppskriftsvisninger med porsjonskontroll og 40 forløpskontroller. Alle 20 nye oppskrifter er åpnet ved 390 px; seks representative nye retter er åpnet ved alle fem bredder, i tillegg til en oppskrift åpnet fra resultatsettet. Kontrollen dekker kort, nummerering 1/2/3, bildelasting, lange titler, ingredienser, instruksjoner, porsjoner, råvaresøk, veiviser og tilbakeflyt til nøyaktig samme resultater.

Ingen horisontal overflow eller avkuttet kontrollert tekst ble observert. Alle synlige kontrollerte matbilder lastet. Porsjonsknappene måler 44 × 44 px. Mobil viser lesbar stabling og korte bildeutsnitt; desktop beholder tre kolonner og oppskriftens to spalter. Lange titler brytes uten å dekke bilder eller knapper. Skjermbilder fra alle fem bredder er visuelt gjennomgått.

En «Hopp til innhold»-boks i noen fullsideskjermbilder var et opptaksartefakt ved scrolling: ved kontroll av faktisk viewport var lenkens bunn -16,8 px og den hadde ikke fokus. Nytt opptak fra toppen viste riktig skjult lenke. Ingen CSS er endret. Ingen JavaScript-pageerror ble registrert. Nettverksavviket under er beholdt i rapporten; det er ikke filtrert bort for å få grønt resultat.

**14. Git-status og avgrensning**

Branch main. HEAD fortsatt d7c4ab45ec99ff0cfd59605a88b00076ad1116b7. Origin https://github.com/jaswane/middagen.git. Arbeidstreet inneholder ukommitterte Sprint 03A-endringer; ingen filer er staged, ingen commit/push/deploy er gjort.

Endringer: lib/meals.json, 40 nye WebP-er, docs/image-manifest.json, docs/image-prompts.md, denne rapporten, nødvendige oppdateringer i fem eksisterende kontrollskript og ny scripts/check-sprint03a.mjs.

To øvrige produktfiler rapporteres eksplisitt: app/om/page.tsx og app/slik-velger-vi/page.tsx. Eneste endring i hver er «Utvalget består av 42 oppskrifter» → «Utvalget består av 62 oppskrifter». Ingen UI-, routing- eller metadata-logikk er endret.

Hele diffen er gjennomgått, inklusive de nye oppskriftene, proveniens og kontrollskriptene. Produktdesign, velger, kortlayout, motor, aliaslogikk, analytics, samtykke, canonical, robots, sitemap-logikk, Vercel, footer, kontaktregel, kreditering og de eksisterende 42 er bevart.

**15. Separat teknisk funn for Claude Code**

P2: Windows-eksportens prefetchede RSC-segmentfiler får feil filsti. Eksempel: nettleseren ber om /slik-velger-vi/__next.slik-velger-vi.__PAGE__.txt og får 404 fra lokal statisk server. Eksporten inneholder i stedet out/slik-velger-vi/__next.slik-velger-vi/__PAGE__.txt. Samme mønster ble sett på /om/, /personvern/ og /kontakt/.

Årsaken er avgrenset i installert Next.js 16.3.4: node_modules/next/dist/export/index.js bruker path.relative ved innsamling av segmentfiler (linje 842), som gir backslash på Windows. convertSegmentPathToStaticExportFilename i node_modules/next/dist/shared/lib/segment-cache/segment-value-encoding.js (linje 95–96) erstatter bare forward slash. En direkte reproduksjon av disse funksjonene gir den observerte forskjellen. Avhengigheter, config og disse kodefilene er ikke endret av sprinten.

Én lesende kontroll av nøyaktig samme /slik-velger-vi/-prefetch-URL på https://middagen.no ga HTTP 200 og text/plain (9 360 byte). Dette støtter at avviket gjelder lokal Windows-eksport; det er ikke en full kontroll av alle prefetchede produksjonsruter. Ingen feil i de nye oppskriftsdataene er påvist.

Konsekvens: de testede middagsforløpene, direkte navigering, porsjoner og tilbakeflyt fungerer, men nettverkskontrollen har et reelt lokalt avvik. Ikke merk hele sprintens QA som ubetinget grønn. Ingen workarounds, endringer i node_modules, eksportfiler, prefetchede lenker eller Vercel-innstillinger er gjort. Claude Code bør undersøke og håndtere Windows-eksport/prefetch i en egen kodesprint dersom full nettverksren lokal eksport er et krav. Motoren trenger ingen påvist feilretting fra denne innholdssprinten.

Arbeidet stoppes før commit i tråd med bestillingen. Innhold og bilder er klare for gjennomgang; den separate nettverksmerknaden må følge med i godkjenningen.
