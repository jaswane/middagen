# Implementeringssprint 01

Mål: klar for realistisk førstegangsbrukertest. Ikke offentlig lanseringsklar.

## Scope og bevaring

Sju avtalte forbedringer. Ingen nye retter, ruter, avhengigheter, bilder, kommersielle elementer, konto eller produktområder. 42 retter beholdt (20 vegetar, 12 kjøtt, 10 fisk). Palett, typografi, desktop-maksbredde og metadata beholdt; oppskriftstitler/Recipe-totalTime følger de tre justerte tidene. HTML fikk Nexts data-scroll-behavior-attributt for korrekt sidenavigasjon.

## Beslutningstilstand og retur

En versjonert sessionStorage-post per nettleserfane: middagen.decision.v1. Lagrer modus, redigerte og anvendte filtre, søk, tolket ingrediens, de viste ID-ene, kandidatpool, seed/runde, sett-historikk, resultatmelding, enkeltvalg, tidligere alternativer og scrolleposisjon. Gjenoppretter synkront før nettleseren maler klientreturen; serverens og første klientrenders utgangspunkt er identisk. Ingen URL-parametre eller history.state-endringer: / og /middag/slug/ forblir delbare, kanoniske adresser. En mottaker av en oppskriftslenke får ikke avsenderens private valghistorikk.

Kun UI-tilstand og rett-ID-er gjenopprettes, med datasignatur og validering. Ugyldig, gammel eller datamessig utdatert lagring forkastes. Minnefallback bevarer vanlig klientnavigasjon hvis sessionStorage blokkeres; full sidelasting uten tilgjengelig lagring kan ikke bevare tilstanden. Nettleserens øktgjenoppretting kan også gjenopprette fanens sessionStorage. Personvernteksten er oppdatert.

Angre enkeltvalg gir nøyaktig de tidligere tre forslagene, samme rekkefølge og samme historikk. Det genereres ikke en ny runde ved angre. Oppskriftenes eksisterende tilbakeknapper og nettleserens Back bruker samme gjenoppretting.

## Søkeregel

Rekkefølge: normaliser → eksplisitt vegetar-intent → eksakt kjent råvare/familie/form → eksplisitt alias → eksplisitt skrivefeil → nulltreff. Ingen edit-distance, delstrengssøk eller generell fuzzy matching. Normalisering gjør små bokstaver, trimmer/slår sammen whitespace, normaliserer æ/ø/å og diakritiske tegn og fjerner et innledende «jeg har» etter whitespace-normalisering. Vegetar og vegetarisk gir kostholdsfilteret vegetar. Pantry-krydder brukes ikke som søkegrunnlag; salt blir nulltreff, aldri salat. Brukerens søk vises i nulltilstanden med handlingene «Prøv en annen ingrediens» og «Gi meg tre middagstips».

### Råvarefamilier (brede søk, ikke påstand om utbyttbarhet)

| Søk | Inkluderer |
|---|---|
| sopp | sjampinjong |
| bønner | kidneybønner, hvite bønner, svarte bønner |
| linser | røde linser |
| nudler | eggnudler |
| fløte | matfløte |

### Eksplisitte aliaser (nøklene er normaliserte)

| Søk | Kanonisk navn |
|---|---|
| potet | poteter |
| polse | pølser |
| polser | pølser |
| eggene | egg |
| kyllingfileter | kyllingfilet |
| kyllingbryst | kyllingfilet |
| kyllinglar med bein | kyllinglår |
| chicken | kylling |
| laksefilet | laks |
| laksefileter | laks |
| salmon | laks |
| torskefilet | torsk |
| torskefileter | torsk |
| karbonadedeig | kjøttdeig |
| spagetti | spaghetti |
| lasagneplate | lasagneplater |
| kikert | kikerter |
| bonne | bønner |
| bonner | bønner |
| kidneybonne | kidneybønner |
| hvit bonne | hvite bønner |
| svart bonne | svarte bønner |
| linse | linser |
| gulrotter | gulrot |
| tomater | tomat |
| sjampinjonger | sjampinjong |
| halloumi | vegetarisk halloumi |
| feta | vegetarisk feta |
| pesto | vegetarisk pesto |
| pizzadeig | pizzabunn |

### Eksplisitt skrivefeilliste

| Søk | Tolkes som |
|---|---|
| kyling | kylling |
| kyllign | kylling |
| kjotdeig | kjøttdeig |
| kjottdei | kjøttdeig |
| lask | laks |
| past | pasta |
| potetr | poteter |

### Råvareformer

ingredientForms skiller råvarefamilie fra egnet form i 13 eksisterende retter. Kyllingfilet/kyllingbryst gir to retter; kyllinglår gir ovnskyllingen. Pasta gir ti retter. Spaghetti/spagetti gir sju retter som kan lages med spaghetti; lasagne, makaroni i tomatsuppe og pølsegrateng utelukkes. Makaroni gir de sju formfleksible pastarettene samt suppen og gratengen. Lasagneplater gir bare lasagne. Raske pastaoppskrifters krav om åtte minutters koketid står på kortet og i oppskriften.

## Variasjon

Filtrering/søkematch bestemmer kandidatpoolen først. Den utvides aldri for variasjon. Deretter prioriteres usette retter foran viste retter. Inne i samme gruppe velges den med lavest likhet med allerede valgte kort: samme kategori +100, samme hovedråvarefamilie +20, samme base/tilbehør +10, samme tilberedningsgruppe +3, summert mot hvert valgt kort. Reproduserbar seed er tie-break. Tilberedning er en enkel gruppering fra eksisterende utstyrstags (ovn, suppe/stavmikser, panne, koking, uten varme), ikke en ny matfaglig klassifisering. Alle treff regnes som relevante når de oppfyller det eksplisitte søket. Variasjon overstyrer aldri filtre, råvareform eller usett-prioritet.

## Filtre

Familievennlig og Noe lett er fjernet fra UI, uten erstatningsfiltre. Historiske datatags er beholdt. Motorens kompatibilitet med de tidligere 54 kombinasjonene kontrolleres fortsatt. Dagens UI har 36 kombinasjoner (3 tider × 4 typer × 3 prisvalg). Tre gir null treff (15 min + kjøtt); fire gir to treff (rimelig fisk og fisk ved 15 min/vanlig-eller-rimelig). Ingen stille fallback.

## Porsjoner

Alltid original quantity × porsjoner / baseServings. Ingen avrundede verdier lagres eller brukes videre i skaleringen. Nullmengde/etter smak beholdes.

- Stk, skiver, bokser og pakker: nærmeste åttedel, redusert brøk og blandet tall. Eksakte åttedeler endres ikke.
- Ss/ts: samme brøkregel. Under 1/4 ss vises i ts (1 ss = 3 ts). Under 1/8 ts vises som «under 1/8 ts», uten å øke mengden. Under 1 klype vises som «under 1 klype».
- Kg konverteres til gram. L/dl konverteres til ml. Gram/ml: nærmeste 5 fra 100, nærmeste 1 fra 10 til under 100, ellers nærmeste 0,5. Under 0,5 vises som en øvre grense.
- Faktisk avrunding merkes «ca.». Eksempel: 87,5 g → ca. 88 g. 0,125 sitron → 1/8 stk. 0,0625 ts pepper → under 1/8 ts.
- Brøkdeler av egg får et kort praktisk råd om å vispe egget og bruke den oppgitte andelen.

## Målrettet oppskriftskontroll

22 unike retter gjennomgått: alle opprinnelige ni 15-minuttersretter, de seks auditoppskriftene og alle med nye råvareformer. Lesekontroll av ingredienser, steg, utstyr, parallell matlaging og tidsforutsetninger; ingen koketest.

| Rett | Kontroll / endring |
|---|---|
| Kyllingwok med ris | Kok risen mens du tilbereder kylling og grønnsaker. Råvareform kontrollert. |
| Kyllingfajitas | 30 → 35 min. Ingen nødvendig tekst- eller tidsendring. Råvareform kontrollert. |
| Ovnskylling med rotgrønnsaker | 55 → 60 min. Store kyllinglår kan trenge mer tid enn anslaget. Råvareform kontrollert. |
| Pasta med kjøttsaus | Ingen nødvendig tekst- eller tidsendring. Råvareform kontrollert. |
| Pølsegrateng med makaroni | Ingen nødvendig tekst- eller tidsendring. Råvareform kontrollert. |
| Kjøttboller i tomatsaus | Ingen nødvendig tekst- eller tidsendring. Råvareform kontrollert. |
| Laks med poteter og brokkoli | Forutsetter tint laks. Kok potetene mens fisken er i ovnen. |
| Kremet laksepasta med spinat | Forutsetter tint laks. Kok pasta og lag saus samtidig. Råvareform kontrollert. |
| Tunfiskpasta med tomat | 15 min forutsetter pasta med 8 min koketid og rask oppkoking. Lag fyllet samtidig. Råvareform kontrollert. |
| Tunfiskwraps med bønner | Ingen nødvendig tekst- eller tidsendring. |
| Nudler med reker og grønnsaker | Forutsetter kokte, pillede og tinte reker. Kok nudler mens grønnsakene steker. |
| Kikertgryte med kokosmelk | Kok risen samtidig med gryten, i en egen kjele. |
| Tomatsuppe med egg og makaroni | 25 min forutsetter at suppe, egg og makaroni koker samtidig i tre kjeler. Råvareform kontrollert. |
| Pestopasta med erter | 15 min forutsetter pasta med 8 min koketid og rask oppkoking. Råvareform kontrollert. |
| Soppomelett med brød | 15 → 20 min. Bruk en bred stekepanne med lokk, så omeletten stivner jevnt. |
| Stekt ris med egg | Forutsetter ferdigkokt ris. Koketid for rå ris kommer i tillegg. |
| Bønnewraps med avokado | Bruk ferdigkokte bønner. Varm lefsene mens bønnene er i pannen. |
| Couscous med kikerter og feta | Bruk ferdigkokte kikerter og couscous som trekker på 5 min. |
| Spinatlasagne med cottage cheese | Ingen nødvendig tekst- eller tidsendring. Råvareform kontrollert. |
| Ost- og bønnequesadillas | 15 min forutsetter to romslige panner. Én panne gir lengre steketid. |
| Kremet sopppasta | Ingen nødvendig tekst- eller tidsendring. Råvareform kontrollert. |
| Brokkolipasta med ostesaus | Kok pasta og lag ostesaus samtidig i to kjeler. Råvareform kontrollert. |

Ingen ingrediensmengder, priser, kategorier eller oppskriftssteg er omskrevet. 15 korte tids-/utstyrsforutsetninger er lagt til på kort og øverst i oppskrift. Rask-taggen er fjernet fra kyllingfajitas etter tidsjusteringen. Utstyrstags er presisert til to kjeler for kikertgryte/brokkolipasta og tre kjeler for tomatsuppe. Åtte retter er nå ≤15 min og 32 ≤30 min.

## Tester og responsive QA

- Eksisterende scripts/check-product.mjs: 9 grupper, inkludert 63 kombinasjoner (de opprinnelige 54 pluss ugyldig kategori). Forventningene for kyllingfilet, spaghetti og linser er oppdatert til den avtalte semantikken.
- scripts/check-sprint.mjs: 16 grupper. Alle 20 bestilte søkeord, eksplisitte feil, former, vegetar-intent, nulltreff, round-trip av alle moduser, historikk etter retur, enkeltvalg + angre, ugyldig lagring, 54 gamle/36 nåværende kombinasjoner, variasjon og porsjoner for 1/2/3/4/6/8 personer.
- Nettleser: direkte, veiviser og ingrediens → oppskrift → både sidens tilbake og browser Back bevarer hele synlige resultattilstanden. Enkeltvalg + browser Back + angre og full reload bestått.
- Alle 36 nåværende kombinasjoner og 24 søk (20 påkrevde + skrivefeil/ukjent) prøvd i UI. Tre ærlige nulltreff og fire visninger med to kort.
- Landing, resultater, ingrediensskjema, veiviser og oppskrift kontrollert ved faktiske CSS-bredder 320, 375, 390, 430, 1280 og 1440. Ingen horisontal overflyt. Desktop innholdsmaksbredde er fortsatt 1192 px innenfor 1320 px ytterskall.
- Mobil: første kort omkring 190–260 px ned etter handling/omvalg (avhenger av melding og knappebrekk), mot omkring 500 før sprinten. Begge beslutningshandlinger ligger før kortene. 320 px bruker to knapperader.
- Inndata og select har 16 px tekst; primærknapp 56 px; porsjonsknapper 44×44 px. Tastatur gir synlig 3 px fokus. Resultatoverskrift får fokus; neste Tab går til første beslutningshandling. Tomt søk gir melding og fokus i feltet.
- Ingen nye fetch/XHR/beacon/WebSocket-kall i appkoden. Analyseadapteren er fortsatt avslått og testet. Nettleserverktøyet gir ikke et fullstendig nettverksspor; dette er kildekontroll, ikke en påstand om at rammeverk eller vertsplattform aldri gjør nettverkskall.
- Fersk konsollkontroll etter retting av Nexts scroll-behavior-varsel: ingen feil, advarsler eller hydration-meldinger i testløpet.
- TypeScript og git diff --check er kjørt. Produksjonsbygg (npm run build / Next.js webpack) bestått: 52 statiske sider, inkludert alle 42 oppskriftsruter. Sites-hjelperens npm-start feilet på Windows; prosjektets uendrede byggkommando ble derfor kjørt direkte. Endelig commit/deploy-status rapporteres i overleveringen.

## Restpunkter

Full redaksjonell QA og koketesting av alle 42 før offentlig lansering. Ingen nye retter er lagt til for hullene ved 15 min/kjøtt eller rimelig fisk. Fysiske iOS-/Android-enheter, skjermleser og feltytelse gjenstår. SessionStorage er lokalt for fanen og er ikke en delbar eller varig middagsplan. Hvis browserlagring blokkeres og hele siden lastes på nytt, kan beslutningen ikke gjenopprettes.
