# Arduino offline — prototip 02

Osnova: `zljix/labos`, 0.15.7-beta.1, commit `b5bc958`.
Korisnik je odredio `labosv2` kao odredište buduće objave nadograđenog Labosa.
Ovaj prototip je zaseban eksperiment na razvojnoj grani: ne mijenja glavnu
aplikaciju, njezin service worker, postojeći ugovor rezultata ni glavne grane.
**Status:** prevođenje i simulacija potvrđeni su u Node testovima i stvarnom
pregledniku. Za prototip 02 provjereni su novi Uno/Nano izvori i ponovno
otvaranje kartice uz ugašen poslužitelj. Provjere prekida i potpunog ponovnog
pokretanja preglednika iz prototipa 01 ostaju zasebna ranija evidencija.
Prototip 02 dodaje zasebnu izgradnju jezgri, manji SDK i identitet paketa.
Potpuna mrežna izolacija ostaje otvorena; vidi EVIDENCE-02.md.
Ranije provjere prototipa 01 zadržane su u EVIDENCE.md.

## Pokretanje

Razvojno računalo:

```sh
npm ci
# Razvojna izgradnja zahtijeva Node, curl, tar i GNU ar.
npm run prototype:avr:build
python3 -m http.server 4187 --directory .build/avr-offline
```

Otvori http://localhost:4187, pritisni **Pripremi paket**, pričekaj potvrdu.
Isključi mrežu. Promijeni interval i poruku u programu. Pritisni **Prevedi
offline**, zatim **Pokreni 1,2 s**. D13 graf i serijski ispis dolaze iz
postojećeg Labosova `AVREngine`, koji izvršava novoprevedeni AVR strojni kod.
Graf je zapis 1,2 sekunde simuliranog vremena, a ne mjerenje zidnog vremena.

Node/Python služe razvoju i prvom posluživanju ovog prototipa. Nisu dio
prevođenja u pregledniku. Nakon spremanja aplikacije i prevoditelja, za
ponovno otvaranje na istoj adresi i prevođenje nije potreban dostupan server.
Za buduću javnu aplikaciju potreban je HTTPS. Ovo još nije integrirana beta.

## Opseg

- Uno i klasični Nano, ATmega328P na 16 MHz.
- Jedan `main.ino`, dodatne `.cpp`, `.c`, `.h` i `.hpp` datoteke u korijenu.
- Stvarni C i C++ prevoditelji, asembler, linker i objcopy u WebAssemblyju.
- Arduino jezgra, `pinMode`, `digitalWrite`, `delay`, `millis`, `Serial`.
- Izvor, pločica, profil prototipa i inačica alata ulaze u SHA-256 ulaza.
- Svako prevođenje provjerava SHA-256 svih spremljenih alata i SDK-a.
- Rezultat formata v2 veže se i uz SHA-256 manifesta paketa. Stari rezultat
  ne može biti prihvaćen pod novim paketom.
- Novi SDK dobiva ključ prema sadržaju. Nadogradnja ponovno koristi iste
  alate, zadržava stari SDK i ne briše projekte ili predmemorije.
- Paket se preuzima i sprema komprimiran (oko 14,1 MiB; raniji prototip koristio je oko 17 MiB).
  Raspakiravanje je ograničeno očekivanom veličinom i provjerom SHA-256.
- Nastavak pripreme pretvara ranije spremljene vlastite nekomprimirane zapise
  na istim ključevima; ne briše predmemorije, projekte ni nepovezane zapise.
- Prekid/izmjena izvora prekidaju Worker i odbacuju prethodni rezultat.
- Sintaksna pogreška ne pokreće prethodni HEX; izvor ostaje spremljen.
- Odvojeno spremanje prototipa; nema brisanja tuđih predmemorija i projekata.

## Granice

Ovo nije potpuna zamjena Arduino IDE-a. Prototip ne generira automatske
deklaracije funkcija. Napiši deklaraciju prije uporabe ili upotrijebi zaglavlje.
Više `.ino` datoteka, poddirektoriji, odabir dodatnih biblioteka, ESP32-S3,
fizičko programiranje pločice i službeno bodovanje nisu uključeni.
Najviše 32 izvorne datoteke / 256 KiB; radni proces ima ograničenje 60 s.
`sketch.cpp` je rezerviran za generirani izvor. `staticRamBytes` ne uključuje
dinamičku memoriju i stog. Worker izolira rad, ali ne postavlja strogo
ograničenje ukupne memorije browsera.

Uno i Nano jezgre izgrađuju se zasebno iz provjerene arhive Arduino AVR 1.8.8,
WASM alatima GCC 15.2.0 i binutils. Uno koristi `ARDUINO_AVR_UNO` / `standard`,
Nano `ARDUINO_AVR_NANO` / `eightanaloginputs`. GNU ar samo pakira prevedene
objekte u determinističke arhive pri razvojnoj izgradnji; nije potreban učeniku.
Jezgre su u ovom opsegu binarno jednake, što je rezultat dviju izgradnji,
a ne preuzimanje zajedničke Nano jezgre. Pin-varijante provjerene su zasebno
(6/8 analognih ulaza); detaljne naredbe su u `core-build-manifest.json`.
C++ iznimke i RTTI nisu podržani. Prekidi koriste podržanu opciju asemblera
`-mgcc-isr`; TIMER1 prekid provjeren je stvarnim izvođenjem u simulatoru.

Postojeći Labos koristi Arduino AVR 1.8.6 / GCC 7.3.0 i zaključane biblioteke.
Prototip namjerno ima zaseban identitet: GCC 15.2.0 / Arduino AVR 1.8.8.
Ne izvozi se kao postojeći `avr-build.json` i ne zaobilazi njegovu validaciju.
Uspjeh nekoliko testova ne dokazuje podršku svim vježbama ili periferiji.

## Podrijetlo i ponovljivost

Odabran kandidat: [PCBKit toolchain](https://github.com/pcbkit-io/toolchain),
izdanje [avr-gcc-15.2.0-pcbkit-4](https://github.com/pcbkit-io/toolchain/releases/tag/avr-gcc-15.2.0-pcbkit-4).
Pregledan recept: commit `58a15c764b5f0b3b8ac9134ec040a552c35b59ce`.
`upstream-manifest.json` zaključava veličine i SHA-256 dobivenih alata i SDK-a.
Build preuzima artefakte s točnog izdanja; aplikacija ih poslužuje sa svojeg
izvora. Tijekom prevođenja čita samo provjerenu CacheStorage kopiju, bez CDN-a.
Svaka instanca alata ima nov virtualni datotečni sustav.

Odabir kandidata temelji se na dostupnom receptu, objavljenim arhivama izvora,
podršci zasebnim C/C++ alatima i mogućnosti vlastitog hostanja. Alternativa
`horang-corp/avr-gcc-wasm` pregledana je, ali njezine obavijesti izričito
traže dodatnu pripremu odgovarajućih izvora/recepta za distribuciju.
Nije preuzet kod AGPL aplikacije `Shubin123/arduino-web`.

Prevoditelj i SDK zadržavaju izvorne licence; MIT licenca Labosa ne zamjenjuje
GPL/LGPL i ostale licence tih komponenti. Build uključuje `NOTICE.json` i
`licenses.tar.gz`, provjerene prema `license-manifest.json`, te punu arhivu
Arduino izvora. Izvorne arhive dostupne su u navedenom izdanju, a recept
u navedenom commitu.
`npm run prototype:avr:sources` preuzima i SHA-256 provjerava sve izvorne
arhive iz zaključanog upstream recepta u `.build/avr-corresponding-sources`.
Recept se lokalno preuzima uz provjeru SHA-256 iz commita `58a15c764b5f0b3b8ac9134ec040a552c35b59ce`.
To je priprema izvora za distribuciju, ne tvrdnja da su GCC/binutils ponovno
izgrađeni u ovom okruženju ili da je riješena sva pravna provjera distribucije.
Vlastite Uno/Nano jezgre jesu izgrađene iz izvora i ponovljena izgradnja
provjerava se prema dobivenim sažecima. Repozitorij upstream recepta na pregledanom commitu nema korijensku LICENSE
datoteku; prava redistribucije samog recepta treba razjasniti prije pakiranja
javnog izdanja. Zato grana čuva URL-ove i sažetke recepta, a skripta ih
preuzima samo u lokalnu razvojnu mapu. Prije javnog izdanja treba uz konkretni
binarni paket objaviti pripadajuće izvore i upute.

## Provjere

```sh
npm run prototype:avr:test
npm run prototype:avr:worker
npm run prototype:avr:package
npm run prototype:avr:memory
npm run prototype:avr:browser
```

Node provjere ne zamjenjuju stvarni browser prihvat. Browser provjera
namijenjena je razvojnom računalu koje dopušta pokretanje Chromiuma. Koristi
Playwright i Chromium, vlastiti trajni profil u
`.build/avr-prototype-profile`, bez čišćenja predmemorije. Varijable
`PLAYWRIGHT_MODULE` i `CHROMIUM_PATH` mogu odrediti lokalne alate. U ovom
radnom okruženju Playwright je dostupan iz primarnog runtimea.
Automatski izvještaj je `.build/avr-offline-evidence.json`; ručno provedeni
browser koraci zabilježeni su u `browser-evidence-02.json` (raniji u
`browser-evidence.json`). Sažetak mjerenja i
preostali koraci vode se u `EVIDENCE-02.md`. Mjerenja iz ovog okruženja nisu mjerenja na
školskom i5-6600 niti potvrda mobilne podrške.
