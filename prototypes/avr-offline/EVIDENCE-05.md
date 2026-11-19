# Prototip 03 — biblioteke i stvarne vježbe

Datum: 20. studenoga 2026. (Europe/Zagreb).
Razvojna grana: `prototype/arduino-offline-avr` u `zljix/labos`.

## Dovršeno lokalno

- 28 kombinacija stvarne vježbe i pločice (14 vježbi × Uno/Nano) prevedeno
  je novim WASM prevoditeljem i izvršeno na njihovom stvarnom Labos sklopu.
- Provjereni AHT10, servo, OLED 128×64/128×32, regulator, BMP180, BMP280,
  AM2320, LCD1602, BMP280 → LCD, DHT11, DHT22, DS18B20 i BMP280 preko SPI-ja.
- Dodatno su prevedeni Bounce2 i EEPROM programi na obje pločice.
  EEPROM provjera čita početnih 255 i zapisuje/čita 42 te adresu 1023.
- 31 test biblioteka (uključuje roditeljsku cjelinu i 28 potprovjera),
  16 ranijih testova prototipa: svi prolaze, nema preskakanja.
- Regresija projekta, sklopa i Arduino ugovora: 37 prolaza, 4 opcionalna
  Arduino CLI testa preskočena. TypeScript provjera glavne aplikacije prolazi.
- Potvrđeni izvoz/uvoz, promjena biblioteka, nevaljane inačice i sažeci,
  ovisnost DallasTemperature/OneWire i isključivost U8g2 paketa.
- Paket se nadograđuje bez brisanja starih SDK-ova i drugih spremišta;
  test prekinute nadogradnje i ponovnog korištenja postojećih alata prolazi.

Node matrica izričito zabranjuje `fetch`, ali sama nije dokaz browser
offline rada. Zasebna CI provjera za ovu etapu još treba biti potvrđena.

Implementacija je spremljena u lokalni commit
`f9ac93f5bd5a5065d3fb0cd9d703685a636d9be1`. Automatska provjera odobrenja
blokirala je `git push` jer nije potvrđeno izričito odobrenje slanja
izvornog koda na GitHub. Slanje nije ponovljeno drugim putem. Udaljena grana
i dalje je na `d05b8a27a4601a25d9ddc2aadde0b229125db690`.
Za dovršetak ostaje odobrenje slanja na postojeću razvojnu granu
`zljix/labos:prototype/arduino-offline-avr`, nakon čega workflow provjerava
ponovljivost SDK-a, sve testove i novi izvor s bibliotekama u potpuno
mrežno izoliranom Chromiumu. Uspjeh te provjere trenutačno se ne tvrdi.

## Paket

Komprimirani alati i SDK: **15.656.278 B (14,93 MiB)**; shell, arhive
izvora i licence nisu uračunati. Raspakirani SDK: **17.361.433 B**.
Identitet paketa:
`e5ca9eb29a44c68fcbebe6160d339edc12a13b77d013af8c4c5573c9f2315924`.

Biblioteke se grade iz zaključanih izvora odvojeno za obje pločice.
Manifest s naredbama i sažecima: `library-build-manifest.json`.
Izvori s licencama: razvojni izlaz `toolchain/labos-library-sources.tar.gz`.
Stari rezultati prototipa zahtijevaju ponovno prevođenje pod novim paketom.

## Dokazi i granice

Lokalni dokazi su u [evidence-05](evidence-05). Mjerenja ovog računala nisu
mjerenja školskog i5-6600 ili fizičkih mobitela. Nema tvrdnje o podršci
svim vježbama izvan provjerene matrice.

Trajanje simulacije može se odabrati (1,2 / 3 / 5 s) da stane i DHT22
stabilizacija. EEPROM je 1024 B i počinje s 0xFF pri svakoj simulaciji;
njegov sadržaj zasad se ne čuva između pokretanja.

Glavna aplikacija, Arduino CLI format, bodovanje i `labosv2` nisu mijenjani.
Preostaju integracija u glavno sučelje, uvjeti distribucije upstream alata
i pilot na školskom računalu i fizičkim mobitelima.
