# Labos 0.15.2-beta.1 · 25C — čitljiviji sklop i kôd

Polazište: `e38636ff5dcbac2aa33e9bdd532c2988b393c8f4`, nastavak plana grafičkog uređenja. Opseg: zljix/labos.

## Dorade

- Prelomi retke u editoru uključuje vizualno prelamanje kroz CodeMirror compartment. Kôd, brojevi izvornih redaka, revizija projekta i povijest uređivanja ne mijenjaju se tom radnjom. Postavka vrijedi tijekom rada u aplikaciji, bez promjene formata projekta.
- Dodavanje komponente zatvara katalog, odabire komponentu, prilagođava pogled i vraća fokus na sklop. Pretraga ima broj rezultata, objašnjenje praznog rezultata i gumb za čišćenje. Esc zatvara katalog i vraća fokus na njegov naslov.
- Datoteke imaju vlastiti gumb za sklapanje. Zatvaranje datoteka ili uputa vraća fokus na pripadni gumb, odnosno mobilni prikaz Sklop.
- Tamnije pomoćne oznake, brojevi redaka i kontrole konzole u svijetloj temi. Boje pogrešaka i aktivnih kontrola prate temu; popravljen tamni tekst na tamnoj pozadini pri prelasku preko primarnog gumba u tamnoj temi.
- Konzola koristi 14 px; kontrole i opisi sklopa 13 px. Svojstva više nemaju dodatno ograničenje visine unutar već pomičnog panela. Editor može koristiti nisko radno područje bez prisilnog minimuma od 300 px.
- Mobilne glavne radnje su kompaktnije; navigacija između područja ostaje pri vrhu tijekom pomicanja. Zaglavlje dijaloga sa zatvaranjem ostaje vidljivo pri pomicanju njegovog sadržaja.
- Ažurirane korisničke upute i oznake izdanja. Bodovanje i format učeničkih projekata ostaju isti.

## Provjere

- TypeScript i produkcijska izgradnja za `/labos/`.
- 57 provjera projekata, spojeva, usmjeravanja vodiča i školske sinkronizacije.
- 8 provjera radnog prostora i nastavnog tijeka, uključujući prošireni test dodavanja komponente, vidljivosti u viewBoxu, odabira, fokusa i zatvaranja tipkom Esc.
- 14 provjera Pages resursa i školskog pilota. Ukupno: 79 ciljanih automatiziranih provjera.
- Preglednik: MicroPython LED program pokrenut i zaustavljen, ispis provjeren; prelamanje zadržava jednak tekst programa; zatvaranje datoteka vraća fokus na mobilni Sklop; pregled svijetle i tamne teme.
- Okviri 390 × 844, 768 × 1024, 1024 × 768, 1280 × 720, 1366 × 768, 844 × 390 i 683 × 384 nemaju vodoravno prelijevanje dokumenta u pregledanom prikazu. Posljednji okvir provjerava prijelom pri raspoloživom prostoru usporedivom s 200 % uvećanjem; nije dokaz stvarnog browser zooma ili fizičkog dodira.
- Prethodna cjelovita školska provjera za 25B završila je uspješno: https://github.com/zljix/labos/actions/runs/44313317331 . Nije prikazana kao nova cjelovita provjera 25C.

## Otvoreno

Stvarni iOS/Android dodir, projektor, učenički pilot i cjeloviti audit pristupačnosti ostaju otvoreni. Beta oznaka ostaje; tehnički prolaz nije potvrda nastavne primjenjivosti u svim uvjetima.

## Stanje objave

Izvedba i provjere sačuvane su u lokalnom commitu `754a23f0645e882759ff25c969dae19ca9f4f534`. Automatski pregled odobrenja odbio je `git push origin main`: zahtjev za nastavak dorade nije prihvaćen kao izričita dozvola za javnu objavu. Nije pokušavan drugi put objave. Udaljeni `main` nakon odbijanja i dalje je `e38636ff5dcbac2aa33e9bdd532c2988b393c8f4`.

Za nastavak nakon izričitog odobrenja: provjeriti aktualni udaljeni main, objaviti pripremljene commitove bez prepisivanja tuđih izmjena, pratiti Pages provjeru te potvrditi stvarno posluženu verziju 0.15.2-beta.1. Lokalni pregled nove verzije je provjeren; javna objava nije provedena.
