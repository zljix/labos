# Prototip 01 — rezultati i točka nastavka

Status: funkcionalno prevođenje i simulacija potvrđeni u testnom runtimeu;
stvarni browser/offline prihvat ostaje otvoren. Ovo nije beta za učenike.
Polazište: Labos 0.15.7-beta.1 (`b5bc95895b4d725dc2a6717ea1f33a3c7144f1b1`).
Buduće odredište objave nadograđenog Labosa je **labosv2**.

## Prošlo

| Provjera | Rezultat |
|---|---|
| Stvarni WASM GCC/binutils → AVR HEX | Uno i Nano |
| Blink i Serial u postojećem Labos AVREngine | Obje pločice; GPIO D13 i LED na D9 |
| Funkcija iz helper.cpp + helper.h | Obje pločice; `REZULTAT=42` |
| Zasebna C datoteka (cc1, ne C++ zamjena) | Obje pločice; `42` |
| Novi izvor uz zabranjen fetch u Node testu | Novi HEX, `UNIQUE_7391`, odgoda 73 ms |
| Sintaksna greška | Prijavljena `main.ino:2` |
| Nedefinirana funkcija pri povezivanju | Odbijena izgradnja |
| Promijenjen izvor, pločica/profil, oštećen HEX | Rezultat odbijen |
| Stvarni izgrađeni browser Worker u VM adapteru | Prevođenje + simulacija, bez mrežnog fetch-a |
| Oštećeni JavaScript u adapteru predmemorije | Odbijen prije izvršavanja |
| Postojeći testovi projekta/sklopa | 29/29 |
| Postojeći AVR testovi | 15/15 nakon lokalne izgradnje aplikacije |
| TypeScript + produkcijska izgradnja Labosa | Prošlo; postojeće upozorenje o velikim JS dijelovima |
| Novi testovi prototipa | 4/4 + 2/2 Worker adapter |

Prvi pokušaj postojećeg AVR testa produkcijskog paketa koristio je preuzeti
Pages `dist` s prefiksom `/labos/`, a test traži korijenski `/assets/`.
Nakon standardnog lokalnog builda svih 15 testova prolazi. Izvedeni `dist`
i datoteka starog mjerenja vraćeni su na početno stanje; nisu dio prototipa.

## Izmjerena vrijednost, bez ekstrapolacije na školsko računalo

Učitavani alati i SDK: **63.419.317 B (60,48 MiB)** prije HTTP kompresije,
bez shell aplikacije i licencnih dokumenata. Paket još sadrži nepotrebne
pločice/biblioteke iz upstream SDK-a; njegovo smanjivanje je zaseban korak.

U Node v24.22.3/Linux šest programa prevedeno je za **589–1229 ms** po
programu u ovom pokretanju. Prvo učitavanje i browser spremanje nisu mjerena.
Vrijednosti uključuju izgradnju, ali ne početno preuzimanje i stvarni browser
prihvat. Podaci i serijski ispisi nalaze se u `node-evidence.json`.

Primjer Blink koristi 2766 B Flash-a i 216 B statičkog SRAM-a. Izmijenjeni
interval 73 ms daje prvi `OFF 72`, zatim `ON 146`, u skladu s rezolucijom
Arduino millis()/delay(). Potrošnja memorije browsera i vršna potrošnja
Worker procesa **nisu izmjerene**. Nema tvrdnje o i5-6600, iPhoneu ili Androidu.

## Nije još potvrđeno

- Otvaranje sučelja, stvarni CacheStorage/service-worker ciklus, priprema paketa.
- Isključena mreža uz promjenu izvora i ponovno pokretanje cijelog preglednika.
- UI prekid, izmjena tijekom prevođenja, očuvanje stvarne postojeće predmemorije.
- Oporavak od kvote, prekinuto ažuriranje, stvarni mobiteli i školsko računalo.

`browser-test.mjs` sadrži ove prihvatne korake, ali nije označen uspješnim.
Pokušaj pokretanja lokalnog Chromiuma zaustavljen je zbog nedopuštenog Unix
socketa. Pokušaj dostupnog preglednika nije dovršio otvaranje prototipa;
automatski sigurnosni pregled odbio je adresu podržanog lokalnog pregleda
`http://127.0.0.1:4173/`, tumačeći je kao promjenu adrese nakon blokade.
Nije pokušano zaobilaženje blokade. Za ponovno otvaranje treba odobrenje.

## Sljedeći korak

1. Provesti stvarni browser test, zatim ispraviti eventualne browser/UX pogreške.
2. Izgraditi i zaključati zasebne Uno i Nano jezgre: kandidat sada ima zajedničku
   Nano jezgru, dok se skice prevode zasebnim makroima i pin-varijantama.
3. Provjeriti podrijetlo/reprodukciju i izvore za vlastiti distributivni paket.
4. Nakon dokaza izvedivosti integrirati u aktualni Labos s novom verzijom
   ugovora rezultata i kontroliranim upravljanjem paketima; objava ide na labosv2.

Za nastavak nisu potrebni izmjene glavne grane ni brisanje predmemorije.
