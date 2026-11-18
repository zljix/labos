# Labos 0.15.3-beta.1 · 25D — offline ažuriranje

Polazište: `c5119c9893df23a726bbb02ae27e035a54714246`. Opseg: samo zljix/labos.

## Nalaz

Nastavljena je otvorena provjera iz 25C. Provjereno je svih 205 javnih datoteka paketa `63813ed0e00f4247` (0.15.2-beta.1): dostupnost, konačni URL, veličina i SHA-256 odgovaraju manifestu. Javni `sw.js` sadržava isti manifest. [Zapis provjere](stage25d-evidence/public-audit-25c.json).

U postojećoj kartici s 0.15.1-beta.1 ponovljena instalacija 25C ponovno je završila općom porukom da novi paket nije pripremljen. Ta poruka ne otkriva konkretnu datoteku ni razlog. Provjera javnih datoteka iz drugog mrežnog okruženja nije dokaz da je preglednik dobio iste odgovore. Uzrok tog konkretnog neuspjeha prije dorade nije potvrđen.

## Dorada

- Najviše četiri istodobna preuzimanja, umjesto 205 uzastopnih zahtjeva.
- Jedan ponovni pokušaj samo za neuspjeli zahtjev. Ponovni URL sadrži očekivani SHA-256 radi izbjegavanja zastarjelog odgovora posredne predmemorije. Sažetak i duljina svakog odgovora i dalje moraju odgovarati manifestu; preusmjerenja i pogrešni sadržaji odbijaju se.
- Paket postaje spreman tek nakon provjere i spremanja svih datoteka. Kanonski offline URL-ovi ostaju isti. Prijašnji paketi, IndexedDB i učenički projekti ne brišu se pri neuspjeloj nadogradnji.
- Status prikazuje broj provjerenih datoteka i konkretnu pogrešku preuzimanja ili spremanja. Ponovna provjera starog paketa ne skriva pogrešku novoga.
- Instalacija čeka izričitu aktivaciju; spremanje projekta i provjera drugih otvorenih kartica ostaju obvezni.
- Nova provjera sučelja uključena je u Pages CI.

## Lokalne provjere

Prošlo je 78 ciljanih provjera: 8 za samostalni offline paket (uključujući stvarni MicroPython Worker), 10 za Pages paket, 1 za offline sučelje, 42 za projekte/spojeve/usmjeravanje, 15 za školsku sinkronizaciju te 2 za radni prostor. Školskih 15 isprva nije moglo raditi bez generiranog kataloga; nakon pripreme kataloga svih 15 prolazi.

Nove regresije pokrivaju zastarjele bajtove i uspješan ponovni pokušaj, trajno neispravan paket, očuvanje prethodnog paketa, ograničenje paralelizma, poruke samo karticama ovog laboratorija te napredak/pogrešku/ponovni pokušaj u sučelju.

Prošle su TypeScript provjera, samostalna i Pages izgradnja. Lokalni Pages paket: `fc2cffcb6ec750b8`. Produkcijska izgradnja i dalje upozorava na velike JavaScript blokove; ovo izdanje ne mijenja razdvajanje aplikacijskih modula.

## Provjera objave

Potvrda javne objave i stvarnog prijelaza starije kartice dodaje se nakon izvršenja. Stvarni iOS/Android dodir, projektor i učenički pilot ostaju otvoreni. Beta oznaka se zadržava.
