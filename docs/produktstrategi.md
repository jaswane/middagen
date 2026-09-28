# Middagen.no – samlet produktbeslutning

Beslutningsgrunnlag, 28. september 2026. Dokumentet samler produkt, design, innhold, teknologi og lanseringskrav. Det er en spesifikasjon for prototypen og videre v1, ikke en rapport fra gjennomført brukerundersøkelse.

Prosjektlederens vurdering: Bygg ett lite beslutningsverktøy med tre innganger og samme datagrunnlag. Første trykk gir tre middager. Filtre og ingredienssøk hjelper når brukeren allerede har en begrensning. Oppskriften fullfører valget. Alt annet må begrunne hvorfor det gjør beslutningen enklere. Ingen kommersielle elementer skal inn i hovedreisen nå.

## A. Produktstrategi

**Produktet i én setning:** Middagen.no hjelper deg å bestemme dagens middag med tre konkrete forslag, med én gang eller tilpasset tid, type og pris.

Primær målgruppe er voksne som bestemmer hverdagsmiddagen for seg selv, et par eller en familie. Situasjonen klokken 16:20 er en designhypotese fra briefen, ikke dokumentert adferd. Studentens budsjett og småbarnsforelderens tid er ulike behov som samme enkle motor kan betjene.

Jobben er: «Når jeg ikke vet hva vi skal spise, hjelp meg å velge noe gjennomførbart uten at jeg må planlegge eller lete.» Differensieringen er beslutningshjelp før inspirasjon: få alternativer, forklarte begrensninger og kort vei til ingredienser og fremgangsmåte.

Merkevareløftet er «Middagstips på sekundet». Støtteteksten presiserer at svaret kommer raskt; det er ikke et løfte om tilberedningstid. Ingen «perfekte», «sunneste» eller individuelt optimale anbefalinger uten grunnlag.

## B. UX og handlingsbudsjett

På forsiden vises logo, «Hva skal vi ha til middag?», én forklarende setning og primærknappen «Gi meg middagstips». Ett trykk viser tre kort på samme side. Hvert kort inneholder navn, én konkret forklaring, omtrentlige minutter, prisnivå og høyst én ekstra relevant egenskap. «Velg denne» åpner retten. Ingen spørsmål kommer før denne verdien.

«Vis tre nye» beholder inngang og begrensninger. «Bare bestem for meg» velger ett av de kvalifiserte forslagene og fremhever det, med lett tilgjengelig oppskrift og mulighet til å få alternativer igjen. Dette er en prototypehypotese: om ett forslag faktisk gjør valget lettere, må undersøkes med brukere.

Veiviseren er ett kort skjema med tid og type som hovedvalg. Pris ligger i en frivillig utvidelse. Ingen av valgene er obligatoriske:

| Felt | Verdier | Begrunnelse |
|---|---|---|
| Tid | God tid / ingen grense, maks 15, maks 30 minutter | Tydelige grenser; «god tid» betyr ingen øvre grense |
| Type | Alt, familievennlig, kjøtt, fisk, vegetarisk, noe lett | Ett lett forståelig valg; familievennlig er redaksjonell vurdering |
| Pris | Alle prisnivåer, rimelig, vanlig | Relative nivåer; ikke en påstand om handlekurvens kronepris |

Feltet «vanlig» tolkes som et pristak som også tillater rimelige retter. Denne betydningen skal vises i feltteksten, eksempelvis «Vanlig eller rimelig». Hovedreisen er åpne skjema, velge tid, velge type og sende inn: fire logiske handlinger. Native select kan kreve flere fysiske trykk avhengig av enheten. Prisvalget er en frivillig utvidelse som bruker flere handlinger. Standardverdier lar brukeren endre bare det som betyr noe.

Ingrediensinngangen har ett merket tekstfelt, søkeknapp og korte eksempler. «Kylling» skal gi middager som faktisk inneholder kylling. «Viser forslag med kylling» bekrefter tolkningen. Ved få treff vises én eller to reelle retter, aldri fyllretter uten ingrediensen. Ved null treff blir søket stående og en tydelig tekst foreslår en annen ingrediens eller direktetips. Valget om å fjerne en begrensning ligger hos brukeren.

Antall personer kommer først på rettesiden når det brukes til å skalere ingrediensmengder. Tiden skaleres ikke automatisk med porsjoner. Innlogging, preferanseprofiler, chatbot, karuseller, lange introduksjoner og obligatoriske modaler er fjernet.

## C. Informasjonsarkitektur

| Route | Oppgave | Indekseringsbeslutning for offentlig v1 |
|---|---|---|
| `/` | Verktøyet og inngangene | Ja, egen canonical |
| `/middag/[slug]` | Fullføre én valgt middag | Ja etter redaksjonell kontroll |
| `/om` | Eier, formål og begrensninger | Ja |
| `/slik-velger-vi` | Forklare datagrunnlag og motor | Ja |
| `/personvern` | Reell behandling og kontaktvei | Ja, tillitsside |
| `/kontakt` | Kontaktinformasjon | Ja; e-postadressen vises kun her |
| Ukjent route | Nyttig 404 med vei tilbake | HTTP 404, utenfor sitemap |

Prototypedomene skal holdes utenfor søk med `noindex` mens innholdet vurderes. Produksjonsdomene og prototypedomene må ikke få motstridende metadata ved publisering. Indekseringsønsket er en lanseringsbeslutning, ikke garanti for Google-indeksering.

Ikke opprett `/middagstips` som kopi av forsiden. Ingen egne filterkombinasjoner, søkeordsarkiver, `/med/[ingrediens]` eller `/go/[slug]` nå. Fremtidige ingredienssider må ha en egen, nyttig oppgave som er bedre løst der enn i dagens søk.

## D. Data og beslutningsmotor

V1 tar utgangspunkt i **42 redaksjonelle utkast** til vanlige middager, lokalt lagret. «Redaksjonelt» beskriver forvaltningsmodellen; det betyr ikke at alle rettene er koketestet. Før offentlig matfaglig lansering må mengder, tid og fremgangsmåte gjennomgås. Prisnivåene er estimater uten livepriser.

Foreslått kontrakt:

```ts
type CostTier = 'billig' | 'vanlig' | 'litt-ekstra';
type IngredientAmount = {
  ingredientId: string;
  label: string;
  quantity?: number;
  unit?: 'g' | 'kg' | 'ml' | 'dl' | 'l' | 'stk' | 'ss' | 'ts';
  note?: string;
  scalable: boolean;
};
type Meal = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  timeMinutes: number;
  prepMinutes?: number;
  baseServings: number;
  costTier: CostTier;
  difficulty: 'enkel' | 'middels';
  familyFriendly: boolean;
  dietTags: ('vegetar' | 'fisk' | 'kjøtt')[];
  mealTags: string[];
  mainIngredients: string[];
  secondaryIngredients: string[];
  pantryIngredients: string[];
  equipmentTags: string[];
  ingredients: IngredientAmount[];
  instructions: string[];
  tips?: string[];
  image?: { src: string; alt: string };
  editorialStatus: 'utkast' | 'gjennomgått';
  reviewedAt?: string;
};
```

Dette er måldatamodellen; implementasjonens faktiske feltnavn kan avvike. Tags kommer fra kontrollerte lister. `vegetar` skal ikke kombineres med fisk eller kjøtt. Egg er vegetarisk, men ikke vegansk. Ubestemte ord som «sunnere» utelates uten definerte kriterier. Utstyr støtter innholdsforvaltningen og er ikke et ekstra filter nå.

Motoren normaliserer store/små bokstaver, mellomrom og kjente synonymer før oppslag. Eksempler er `potet → poteter`, `kyllingfilet → kylling` og `spagetti → pasta`. Den må ikke gjøre `kjøttdeig → kylling` eller utlede allergisikkerhet fra en tag. For en nær skrivefeil kan grensesnittet si «Mente du kylling?» og la brukeren velge. En automatisk retting er bare forsvarlig ved en entydig kjent variant, og tolkningen vises alltid.

Filtrering skjer før rangering: tid, type, pris og eventuell ingrediens må alle stemme. Både hovedingrediens og sekundæringrediens gir treff. Basisvarer som bare står under pantryIngredients, for eksempel salt og olje, brukes ikke til søk. For likeverdige treff brukes en stabil rekkefølge med eksplisitt variasjonsfrø. Samme input og frø skal gi samme svar. Neste runde prioriterer retter som ikke var i forrige runde, og forskjellige hovedråvarer når det er mulig.

Med bare to kvalifiserte retter kan motoren ikke gi tre nye. Si «Dette er de to rettene som passer» og behold begrensningene. Tomt søk ber om en ingrediens. Ukjent ingrediens gir en forståelig tomtilstand. Ingen treff etter filtre gir forslag til en konkret endring, for eksempel å øke tidsgrensen, men endringen utføres først ved brukerens handling.

## E. Designsystem

Identiteten er varm og redaksjonell: elfenben, gul aksent, dyp plomme og mørke, tydelige bokstaver. Forslag til designverdier er `#FAF7EF` bakgrunn, `#F2D278` aksent, `#38263D` hovedtekst og `#D8D0C9` skillelinjer. Kontrast må måles på faktisk kombinasjon; fargekoder alene dokumenterer ikke tilgjengelighet.

Logoen er et typografisk «middagen.no» med særpreget serif. Favicon forenkles til en tydelig liten m-form eller en enkel tallerkenreferanse uten detaljrik matillustrasjon. Prototypen bruker Georgia til overskrifter og Arial til brødtekst og betjening. Dette er systemfonter, uten eksterne fontkall. En beslektet, selvhostet humanistisk sans kan vurderes ved senere merkevarearbeid.

Komponentfamilien er liten: header, primærknapp, tekstlenke, middagskort, select, søkefelt, statusmelding og oppskriftsseksjon. Knapper og felt har 2–4 px radius, presise kanter og ingen glød. Skillelinjer organiserer siden; alle avsnitt skal ikke pakkes i kort. Hovedknappen har plommefarget tekst på gult. Fokus får en tydelig kontrasterende ring med avstand til kanten. Hover er et tillegg, ikke eneste tegn på handling.

Spacing følger 4/8/12/16/24/32/48/64 px. Touchmål siktes mot minst 44 × 44 px som intern kvalitetsstandard. Tekst i felter er minst 16 px. Enkle linjeikoner forklarer tid og navigasjon, men tekst bærer betydningen. Bilder brukes bare når de gjør rettene enklere å skille; 3:2-format i kildebildet med reserverte dimensjoner hindrer hopp.

Desktop har rolig sidebredde rundt 1120 px og tre resultater ved siden av hverandre. Mobil viser kortene vertikalt med korte avstander og tydelig handling. Ingen horisontale karuseller. Første skjerm skal vise primærhandlingen; lange oppskriftsinstruksjoner skal ikke skyve den bort. Redusert bevegelse respekteres, og oppdateringer har ingen kunstig ventetid.

## F. Prototype og teknisk ramme

Det faktiske visuelle utkastet leveres separat fra dette dokumentet. Her er skjermkontrakten: forside før handling; tre resultater; ett valgt hovedforslag; veiviserskjema; filtrert resultat; ingrediensfelt; ingredienstreff; null treff; mobil hovedreise; retteside; header/footer; og rolig oppdateringsstatus. Fremtidig kommersiell boks hører hjemme i designreferansen, ikke på den publiserte produktforsiden.

Målarkitekturen er Next.js-kompatibel React og TypeScript med statisk eksport. Oppskrifter og tillitssider prerendres. Kun velger, søk og porsjonskontroll trenger klienttilstand. Den implementerte datakontrakten finnes i lib/types.ts; koden under er en foreslått videreutvikling, ikke en påstand om implementerte redaksjonsfelt. Lokal data og rene funksjoner gjør motoren uavhengig av backend, AI-API og nettverk etter lasting. Generering av route, canonical og eventuell JSON-LD bygger på samme rettsobjekt.

**Verifikasjonsgrense:** Dokumentet bekrefter beslutningene og kildegrunnlaget, ikke at prototypen allerede har passert alle testene. Ingen brukerintervjuer, koketester, produksjonsmålinger eller konverteringsresultater er gjennomført som del av denne dokumentasjonen. Leveransens QA-resultater må beskrive faktisk utførte kontroller separat.

## G. Merkevarefamilie

Middagskasser.no skal senere dele typografi, grid, kantbehandling og illustrasjonsfamilie. Middagen.no beholder varm gul og elfenben som egen signatur. Søstersiden kan bruke dempet fiolett som hovedaksent, plomme som tekst og oker som mindre detalj. Felles kvalitetsnivå gir slektskap uten like forsider.

Oppgavene holdes tydelige: Middagen.no avgjør dagens rett; Middagskasser.no hjelper med å vurdere planlegging og levering over flere dager. Søstersiden bygges ikke i dette prosjektet.

## H. Kommersialisering

| Modell | Status | Mulig plassering og terskel |
|---|---|---|
| Matkasser | Senere | Én rolig boks etter fullført hovedverdi; test om den hjelper |
| Kjøkkenutstyr | Senere | Ett relevant produkt etter oppskrift, bare ved reelt behov |
| Dagligvarer | Senere, uavklart | Krever faktisk avtale, produktmatching og fungerende handlekurv |
| Sponsing | Senere | Tydelig avsender og merking; aldri skjult påvirkning av motor |
| Displayannonser | Sannsynligvis ikke i tidlig produkt | Trafikk og dokumentert økonomi må forsvare friksjonen |
| Premium | Senere, behov må dokumenteres | Ingen betalingsmur rundt dagens grunnfunksjon |
| Nyhetsbrev | Senere | Bare ved uttrykt behov for en konkret gjentakende verdi |

MVP har ingen kommersielle moduler. Et fremtidig eksempel kan hete «Lei av å finne på middag hver dag?» med «Sammenlign matkasser», plassert etter resultat og uten å bli et fjerde middagsforslag. Ingen eksisterende partneravtaler forutsettes.

Betalte lenker får synlig norsk merking og `rel="sponsored nofollow"`. Google foretrekker `sponsored` for betalte plasseringer og tillater flere verdier. [Google om betalte lenker](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links), hentet 28.09.2026. Forbrukertilsynets veiledning understreker at reklame må kunne gjenkjennes og annonsør fremgå; den konkrete fremtidige modulen skal vurderes når den finnes. [Veiledning om reklamemerking](https://www.forbrukertilsynet.no/wp-content/uploads/2017/12/Forbrukertilsynets-veileder-om-merking-av-reklame-i-sosiale-medier.pdf), hentet 28.09.2026.

En eventuell senere `/go/`-struktur skal ha en avgrenset partnerliste og aldri godta vilkårlige eksterne adresser. Den skal ikke ligge i sitemap. Oppskriftsrangering har ingen provisjonsfelt.

## I. SEO og direkte svar

Forsidens metadata beskriver verktøyet: «Middagen.no – middagstips på sekundet». Rettesiden bruker rettens faktiske navn og tid, uten lange rekker av synonymer. H1, kort forklaring og reelt innhold svarer direkte. Ingen FAQ uten et spørsmål brukeren faktisk trenger svar på.

Canonical er absolutt produksjonsadresse for hver godkjent route. Søketilstand blir ikke egne indekserbare sider. Sitemap inneholder bare publiserte canonical-sider; `lastmod` må gjenspeile faktiske endringer. Rettesider lenkes fra resultatene, og relevante interne lenker forklarer hvor brukeren kommer. Ikke lag skjulte lenkeblokker for søkemotorer.

JSON-LD beskriver det som faktisk vises. Prototypen genererer grunnleggende Recipe-data fra hver konkret rett. Bare lakseretten har et representativt illustrasjonsbilde. Øvrige retter har ingen image-egenskap og er ikke klare for Googles Recipe-rich-results. Google krever navn og bilde for Recipe-rich-results; et generisk illustrasjonsbilde av mat erstatter ikke et representativt bilde av retten. Manglende bilde betyr at rik oppskriftsvisning utsettes. Ingen oppdiktede stjerner, anmeldelser, ernæringstall eller forfattermeritter. [Googles Recipe-dokumentasjon](https://developers.google.com/search/docs/appearance/structured-data/recipe), hentet 28.09.2026.

Strukturerte data skal samsvare med synlig innhold. Korrekt markup gir ingen garanti for utvidet søkeresultat. [Googles retningslinjer for strukturerte data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), hentet 28.09.2026. Disse prinsippene gir også forståelige sider for direkte svar og AI-søk uten særskilt kunstig tekst.

## J. Måling og personvern

**GA4 er planlagt, ikke aktivert i prototypen.** Ingen tredjepartsmåling trengs for at produktet virker. Fremtidig oppsett velger eksplisitt opt-in og laster ikke GA4 før samtykke. Avvisning skal være like enkel og synlig som aksept, og samtykke skal kunne trekkes tilbake. Dette følger anbefalingene i [Datatilsynets samtykkeveiledning](https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bruk-av-informasjonskapsler-og-andre-sporingsteknologier/?print=true), hentet 28.09.2026. Samtykkedesign alene dokumenterer ikke all personvernetterlevelse; behandlingsansvar, avtaler og faktisk dataflyt må avklares før aktivering.

| Events | Tillatte opplysninger |
|---|---|
| `instant_suggestions_click`, `suggestions_shown` | Inngang, antall treff |
| `suggestions_refresh`, `meal_selected` | Inngang, stabil rett-ID |
| `guided_picker_start`, `guided_picker_complete` | Forhåndsdefinerte filterverdier |
| `ingredient_search`, `ingredient_search_result` | Kanonisk ingrediens-ID, antall treff |
| `ingredient_search_no_result` | Feilkategori; aldri rå søketekst |
| `recipe_open` | Rett-ID, intern inngang eller direkte besøk |
| Fremtidig `matkasse_cta_click`, `affiliate_click` | Partner-ID og navngitt plassering |

Rå fritekst sendes aldri til GA4. Ukjente ord grupperes som «ukjent», selv om det gir svakere innsikt i manglende råvarer. Ikke send e-post, husholdningsprofil, bruker-ID eller full URL med søketekst. Google forbyr innsending av personidentifiserende informasjon og advarer spesielt om søkefelt og sideadresser. [Google Analytics: unngå personidentifiserende data](https://support.google.com/analytics/answer/6366371?hl=en), hentet 28.09.2026.

Kjerne-KPI er andelen samtykkede økter med viste forslag som leder til valgt rett. Støttemål er tid fra landing til første forslag, omvalg per valgt rett, tomtreffandel og fordeling mellom inngangene. Høy omvalgsrate kan bety dårlig treff eller lyst til variasjon; den tolkes sammen med valgt rett. Samtykkede økter representerer ikke nødvendigvis alle brukere. Tallfestede suksessgrenser fastsettes først etter en baseline.

## K. QA og release

Følgende er releasekrav, ikke en påstand om beståtte tester:

- Ett trykk gir tre distinkte retter uten nettverkskall til en motor. Nye forslag beholder filtrene. Én rett kan velges og åpnes direkte.
- Tid testes på 15, 30 og 45 minutter samt rett over hver grense. Vegetarresultater skal aldri inneholde fisk eller kjøtt. Prisvalg følger den forklarte taklogikken.
- Test tom streng, bare mellomrom, store bokstaver, norske bokstaver, kjent synonym, entydig skrivefeil, ukjent ord, null/ett/to treff og oppbrukt kandidatsett.
- Test direkte oppskriftsadresse, oppdatering av siden, tilbakeknapp, ugyldig slug, 404 og internlenker. Porsjonsskalering skal beholde udefinerte mengder som tekst.
- Kontroller 320, 375, 390, 768 og 1440 px bredde, stående mobil, 200 prosent zoom og langt rettsnavn. Ingen horisontal overflyt eller skjult primærknapp.
- Hele reisen gjennomføres med tastatur. Labels, fokusrekkefølge, statusmelding og kontrast kontrolleres. Resultatoppdatering annonseres rolig uten å lese hele siden på nytt.
- Produksjonsbygg, TypeScript og meningsfulle motortester må passere. Datavalidering sjekker unike ID-er/slugs, positive tider/porsjoner, ingrediensreferanser og samsvarende tags.
- Nettverksfanen kontrolleres for uventede scripts. SEO kontrolleres på levert HTML, ikke bare DOM etter JavaScript. Hosting må returnere reell 404 og bevare direkte routes.

Matfaglig gjennomgang, faktiske mobilnettlesere og en liten brukertest før bred lansering er fortsatt nødvendige dersom de ikke inngår i prototypeleveransen. Registrer observasjon og feil separat fra antakelser.

## L. Knallhard scope

| MVP | Senere ved dokumentert behov | Utenfor denne produktretningen |
|---|---|---|
| Tre forslag, omvalg, ett fremhevet valg | Favoritter og enkle lokale preferanser | AI-chatbot som hovedinngang |
| Tre valgfrie filtre og ingredienssøk | Egen ingrediensside med selvstendig nytte | Masseproduserte søkeordsider |
| 42 lokale middagsutkast | Flere kvalitetssikrede retter | Hundrevis av genererte oppskrifter |
| Oppskrift og valgfri porsjonskontroll | Ukemeny og handleliste | Kaloriregime og næringsdatabase |
| Tillitssider og måleplan | Samtykkestyrt GA4 | Påtvunget registrering |
| Lett statisk frontend | Dokumentert partnerintegrasjon | Skjult kommersiell rangering |

Ingen CMS, database, abonnement, pushvarsler, sosial funksjonalitet, familieprofiler eller kjøleskapsskanner nå. Ny funksjon krever en konkret observert friksjon og en forklaring på hvordan den gjør middagsvalget lettere.

## M. Fem vesentlige risikoer

1. **Forslagene oppleves irrelevante.** Et avgrenset datasett kan bli repetitivt. Varier hovedråvarer, behold begrensninger og mål omvalg sammen med valgt rett.
2. **Valget blir et nytt spørreskjema.** Hold direktetips først, alle felt valgfrie og detaljer etter valg. Tell faktisk antall handlinger i mobiltesten.
3. **Oppskriften svikter etter et godt valg.** Urealistiske tider eller mengder ødelegger tillit. Merk estimater, kontroller data og prioriter matfaglig gjennomgang før flere retter.
4. **Produktet glir over i innholdsportal eller reklameflate.** Sett egne terskler for nye routes og kommersielle plasseringer. Hovedreisen skal fungere like godt når kommersielt innhold fjernes.
5. **Teamet forveksler prototype med dokumentert effekt.** Skill teknisk QA, brukertest og produksjonsdata. Under-fem-sekunder-forståelse og bedre beslutninger er hypoteser til de er observert.

Prosjektlederens samlede anbefaling er en v1 med ett verktøy, 42 gjennomgåtte hverdagsretter og en fullførbar oppskrift. Gjør ett trykk og tre relevante forslag pålitelig før trafikk, innholdsbredde eller inntekter optimaliseres.
