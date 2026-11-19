# Arduino offline — prototip 01

Osnova: `zljix/labos`, 0.15.7-beta.1, commit `b5bc958`.
Korisnik je odredio `labosv2` kao odredište buduće objave nadograđenog Labosa.
Ovaj prototip je zaseban eksperiment na razvojnoj grani: ne mijenja glavnu
aplikaciju, njezin service worker, postojeći ugovor rezultata ni glavne grane.
**Status:** prevođenje i simulacija potvrđeni su u Node testovima i stvarnom
pregledniku. U browseru su prošli novi izvor, Uno/Nano, prekidi i ponovno
otvaranje kartice uz ugašen poslužitelj. Potpuna mrežna izolacija i ponovno
pokretanje cijelog browsera ostaju otvoreni; vidi EVIDENCE.md.

## Pokretanje

Razvojno računalo:

```sh
npm ci
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
- Paket se preuzima i sprema komprimiran (oko 17 MiB umjesto 60,5 MiB).
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

Upstream SDK ima prekompiliranu Arduino jezgru za Nano. Uno skica se prevodi
s makroom `ARDUINO_AVR_UNO` i varijantom `standard`, Nano s `AVR_NANO` i
`eightanaloginputs`; zajednička prekompilirana jezgra je Nano/ATmega328P.
To je prihvatljivo polazište za ograničene GPIO/Serial testove prototipa,
ali nije tvrdnja da je paket ekvivalentan službenoj Uno izgradnji. Prije
produkcijske integracije izgraditi i provjeriti jezgru zasebno za svaku pločicu.

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
`licenses.tar.gz`. Izvorne arhive i recept dostupni su u navedenom izdanju.
Prije javne distribucije osigurati odgovarajuće izvore uz naš konkretni paket,
te reproducirati i dokumentirati vlastite jezgre Uno/Nano. Ovo lokalno
ispitivanje koristi postojeće binarne artefakte; ne tvrdi da su ponovno
izgrađeni iz izvora u ovom okruženju.

## Provjere

```sh
npm run prototype:avr:test
npm run prototype:avr:worker
npm run prototype:avr:package
npm run prototype:avr:browser
```

Prve tri naredbe ne zamjenjuju stvarni browser prihvat. Browser provjera
namijenjena je razvojnom računalu koje dopušta pokretanje Chromiuma. Koristi
Playwright i Chromium, vlastiti trajni profil u
`.build/avr-prototype-profile`, bez čišćenja predmemorije. Varijable
`PLAYWRIGHT_MODULE` i `CHROMIUM_PATH` mogu odrediti lokalne alate. U ovom
radnom okruženju Playwright je dostupan iz primarnog runtimea.
Automatski izvještaj je `.build/avr-offline-evidence.json`; ručno provedeni
browser koraci zabilježeni su u `browser-evidence.json`. Sažetak mjerenja i
preostali koraci vode se u `EVIDENCE.md`. Mjerenja iz ovog okruženja nisu mjerenja na
školskom i5-6600 niti potvrda mobilne podrške.
