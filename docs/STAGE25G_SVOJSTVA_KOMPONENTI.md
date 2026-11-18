# Labos 0.15.6-beta.1 · 25G — preglednija svojstva komponenti

Polazište: ed5b610, 0.15.5-beta.1. Izmjene samo u zljix/labos.

## Izvedeno

- Električne postavke i naziv komponente ostaju odmah dostupni; položaj i zakretanje čine zasebnu sklopivu cjelinu ispod njih. Brisanje je vizualno odvojeno.
- Polja svojstava prilagođavaju se širini panela; oznake i gumbi koriste 14 px, a česte kontrole na dodiru najmanje 44 px visine.
- Uz odabranu komponentu prikazuju se postojeće dijagnostičke poruke koje joj pripadaju. Odabir poruke prikazuje priključak i njegovu mrežu bez promjene projekta. Ukupna provjera spojeva ostaje dostupna u svojoj kartici.
- Pomoć razlikuje BMP280 I2C od zasebne SPI komponente. Uklonjena je zastarjela opća tvrdnja da Arduino simulacija nije implementirana; učenika se upućuje na odgovarajući primjer i podršku konkretnog cilja.
- Format projekata, električni modeli, programi vježbi i bodovanje nisu mijenjani.

## Provjera

Prošle su TypeScript provjera i produkcijske izgradnje za /labos/ i korijen.
Ukupno 81 ciljana provjera: nastavne i UI provjere 6, projekti/spojevi 29, Pages 12, offline 8, zaštite prostora 11, raspoređivanje vodiča 13 i radni prostor 2.
Proširena UI regresija provjerava raspored kontrola, prikaz upozorenja i prijelaz na priključak bez mutacije projekta; prethodni pokusi pomicanja i spremanja SD/RTC snimki također prolaze.

Prvi offline pokus pokrenut je nad Pages izgradnjom i pao je zbog pogrešne osnovne putanje testne pripreme. Nakon odgovarajuće korijenske izgradnje svih osam offline testova prolazi. Pages testovi provjereni su zasebno nad /labos/ izgradnjom.

## Status i nastavak

Razvojna stranica otvorena je s novom oznakom verzije, ali vizualni prihvat nije proveden: preglednik je blokirao pristup postavkama za čišćenje predmemorije. U nastavku je provjerena dostupnost zasebne prazne sesije: upravljani Chromium ima onemogućen privatni prozor. Postavke upravljanja nisu mijenjane, a testovi sučelja nisu nastavljeni nad starom predmemorijom. Postojeći projekt ostao je sačuvan.

Kod i prethodno provjerene izgradnje ostaju nepromijenjeni. Izdanje zadržava status tehničke beta verzije; objava nije potvrda vizualnog prihvata ni stvarnog offline rada. Objavu i rezultat Pages provjera zabilježiti nakon dovršetka.

Otvoreno: dopušten testni preglednik s očišćenom predmemorijom, svojstva i dijagnostika u obje teme i na malom zaslonu, hladno offline otvaranje, stvarni mobilni uređaji i učenički pilot. Opsežna školska regresija prethodnog izdanja 25F još je u tijeku pri pregledu; ne prikazivati je kao završenu.

## Sačuvano za objavu

Izvor i izgrađeni paket spremljeni su na grani `codex/25g-component-properties`, commit `88ef922745168d4594d8f6b14ec2afa32d53ec35`. Stablo `82e566b171ed2e0bcbe63e440a08743a32f969ab` potpuno odgovara lokalno pripremljenom izvoru i paketu.

Otvoren je [nacrt PR-a #1](https://github.com/zljix/labos/pull/1). Pokušaj objave na `main` odbila je automatska provjera uz obrazloženje da zahtjev „Nastavi” ne predstavlja dovoljno izričito odobrenje promjene zadane grane. Odbijanje nije zaobiđeno. Ponovni dohvat potvrđuje da `main` ostaje na `ed5b6102ae467646ab38c7a2f5aa0826a93ca3bd` (0.15.5-beta.1).

Sljedeći korak nakon odobrenja objave: ponovno provjeriti vrhove grana, spojiti pripremljene izmjene, pratiti Pages izgradnju do završetka i potvrditi posluženo izdanje. Ne ponavljati već uspješne lokalne provjere bez promjene koda ili novog nalaza. Ograničenja pregledničkog prihvata i školskog pilota ostaju zasebno otvorena.
