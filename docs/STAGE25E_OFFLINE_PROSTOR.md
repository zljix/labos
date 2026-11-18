# Labos 0.15.4-beta.1 · 25E — prostor za offline pakete

Polazište: `0645bd36700df39e5edded89ac7247f1828c9373`. Opseg: samo zljix/labos.

## Provedena dorada

- Status prikazuje broj paketa ovog laboratorija i broj kandidata za uklanjanje. Pregled ne briše ništa; gumb za uklanjanje ponovno provjerava stanje.
- Prepoznaju se samo vlastita imena predmemorije s točnom putanjom laboratorija i 16-znamenkastim identifikatorom izgradnje. Predmemorije drugih aplikacija i neprepoznata imena ostaju netaknuti, uključujući podputanje pri instalaciji u korijenu domene.
- Zaštićeni su trenutačni paket, aktivna služba, verzije koje čekaju ili se instaliraju te verzije svih otvorenih kartica. Prije uklanjanja kartice i službe odgovaraju na zasebne upite. Stara/nepoznata kartica, izostanak odgovora, nova kartica ili promjena službe zaustavljaju uklanjanje. Timeout nije dopuštenje za brisanje.
- Čišćenje radi isključivo s CacheStorage paketima. Ne pristupa IndexedDB projektima, povijesti, školskoj bazi ni pohrani drugih aplikacija.
- Ako upis odbije kvota, nepotpun novi paket uklanja se kao i ranije. Slijedi provjera sigurnog oslobađanja starih paketa. Samo ako je prostor doista oslobođen, upis već provjerenih odgovora ponavlja se jednom; SHA-256 i provjera duljine nisu oslabljeni. Neuspjeh ne aktivira nepotpun paket.
- Poruke odvojeno objašnjavaju kvotu, druge pogreške upisa i pogreške preuzimanja. Procjena prostora označena je kao procjena cijele domene, bez obećanja uspješnog upisa ili zaključka o slobodnom prostoru na disku.
- Popravak već potpunog paketa više ga nepotrebno ne prepisuje. Ručno spremanje projekta prije aktivacije nove verzije i blokada nadogradnje s više kartica ostaju očuvani.
- Upute i oznake izdanja ažurirane su. Format projekta, vježbe i rubrike bodovanja nisu mijenjani.

## Provjere

Prošlo je 89 ciljanih automatiziranih provjera: 11 zaštite/čišćenja prostora, 1 proširena provjera offline sučelja, 8 samostalnog offline paketa s pravim MicroPythonom, 10 Pages resursa i offline paketa, 42 projekata/spojeva/usmjeravanja, 2 radnog prostora te 15 školske sinkronizacije. Prošle su obje produkcijske izgradnje i TypeScript provjera. Testovi prostora dodani su u Pages CI.

Regresije izričito pokrivaju zaštitu svih korištenih verzija, korijensku i poddirektorijsku instalaciju, neodgovarajuće kartice, promjenu registracije, novi prozor tijekom provjere, zahtjev iz druge aplikacije, oporavak nakon oslobađanja prostora, trajno odbijanje kvote i izostanak nepotrebnog ponovnog upisa potpunog paketa. U testnom okruženju svaki pristup IndexedDB-u iz službe predstavlja pogrešku.

U pregledniku je prikazan novi odjeljak prostora i prošla je ugrađena provjera stvarnog MicroPythona (Worker, WASM, GPIO, vremenska stanka, framebuf). U upravljanom lokalnom pretpregledu offline instalacija odbijena je jer sadržaj `/diagnostics.html` nije odgovarao manifestu; to nije korišteno kao dokaz uspješne offline instalacije. Bajtno provjereni izgrađeni paketi prolaze automatizirane testove.

## Granice i nastavak

Popravak omogućuje sigurno oslobađanje prostora, ali ne jamči uklanjanje izvornog ograničenja udaljenog preglednika. Ako aktivni paket i ostala pohrana već zauzimaju sav dostupni prostor, oni se ne brišu radi prisilne instalacije. Starije kartice bez odgovora moraju se prvo sigurno spremiti i zatvoriti.

Stvarni iOS/Android uređaji, projektor i učenički pilot ostaju otvoreni. Beta status ostaje. Završni rezultat javne objave i pregledničkog prijelaza bilježi se nakon objave.

## Nastavak provjere 18. studenoga 2026.

Pripremljene izmjene sačuvane su lokalnim commitom `effe2dd`. Ponovljene su provjere zaštite prostora (11), offline sučelja (1), samostalnog offline paketa (8) i Pages paketa (10); obje izgradnje prolaze. Test samostalnog paketa mora se izvoditi nakon korijenske izgradnje, a Pages test nakon izgradnje za `/labos/`.

Pokušaj novog automatiziranog pregledničkog prijelaza nije izvršen: lokalni Chromium nije mogao otvoriti sistemski socket u ovom okruženju. U udaljenom pregledniku sačuvana je postojeća kartica 0.15.1-beta.1 i lokalni projekt; ništa nije brisano. Zato nadogradnja 25E u stvarnom pregledniku i njezin rad bez mreže još nisu potvrđeni.

Automatska provjera odobrenja odbila je slanje na javnu granu `main`, navodeći izostanak izričitog odobrenja objave u trenutačnom zahtjevu i nedovršenu pregledničku provjeru. Objavu ne treba smatrati obavljenom: ponovni dohvat `package.json` iz GitHuba potvrđuje `0.15.3-beta.1`. Sljedeći korak nakon odobrenja je objava spremljenog commita, praćenje Pages izgradnje te provjera javnog izdanja i sigurnog ažuriranja. Repozitorij `labosv2` nije mijenjan.

Završno su ponovno prošle i provjere projekata/spojeva (29), usmjeravanja vodiča (13), radnog prostora (2) i školske sinkronizacije (15): ukupno 89/89 ciljanih automatiziranih provjera u ovom nastavku.
