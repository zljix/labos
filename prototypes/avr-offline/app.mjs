import {installPackage,packageStatus,PACKED_BYTES} from './package.mjs';
import {validateResult,normalizeInput} from './compiler.mjs';
import {EXAMPLES} from './examples.mjs';
const $=id=>document.getElementById(id);
const storageKey='labos-avr-offline-prototype-project-v1';
let files=structuredClone(EXAMPLES.blink.files), active='main.ino', result=null, simulation=null, worker=null, timer=null, job=0, ready=false;
try {const saved=JSON.parse(localStorage.getItem(storageKey));if(saved){const input=normalizeInput(saved);files=input.files;$('board').value=input.board;}}catch{}
const input=()=>({board:$('board').value,files:structuredClone(files)});
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(input()));}catch{$('status').textContent='Preglednik nije spremio izmjene. Kopiraj kod prije zatvaranja.';}}
function clearOutput(){simulation=null;$('serial').textContent='Izmijenjeni program još nije pokrenut.';$('led').classList.remove('on');$('transitions').textContent='';$('wave').getContext('2d').clearRect(0,0,800,100);}
function invalidate(){result=null;clearOutput();$('run').disabled=true;$('diagnostics').textContent='Izvor je promijenjen; potrebno je novo prevođenje.';$('status').textContent='Izmijenjeni program još nije preveden.';if(worker)cancel('Izvor je promijenjen. Posao je prekinut.');persist();}
function tabs(){
  $('tabs').replaceChildren();
  for(const name of Object.keys(files)){
    const button=document.createElement('button');button.textContent=name;button.role='tab';button.setAttribute('aria-selected',String(name===active));button.onclick=()=>{active=name;tabs();};$('tabs').append(button);
  }
  $('code').value=files[active];$('code').setAttribute('aria-label','Izvorni kod: '+active);
}
$('code').oninput=()=>{files[active]=$('code').value;invalidate();};
$('board').onchange=invalidate;
$('example').onchange=()=>{files=structuredClone(EXAMPLES[$('example').value].files);active='main.ino';invalidate();tabs();};
function end(){worker?.terminate();worker=null;clearTimeout(timer);$('cancel').disabled=true;$('compile').disabled=!ready;}
function cancel(message='Posao je prekinut.'){job++;end();result=null;$('run').disabled=true;clearOutput();$('status').textContent=message;}
$('cancel').onclick=()=>cancel();
async function runJob(type) {
  if(worker)return;
  const snapshot=input(), id=++job;
  if(type==='compile'){result=null;clearOutput();$('diagnostics').textContent='Pripremam lokalne datoteke prevoditelja…';}
  $('compile').disabled=true;$('run').disabled=true;$('cancel').disabled=false;
  $('status').textContent=type==='compile'?'Prevodim u pregledniku…':'Simuliram 1,2 sekunde…';
  worker=new Worker(new URL('worker.js',location.href));
  const fail=message=>{if(id!==job)return;end();result=null;clearOutput();$('run').disabled=true;$('status').textContent='Program nije pokrenut.';$('diagnostics').textContent=message;};
  timer=setTimeout(()=>{cancel('Posao je prekinut nakon 60 sekundi.');},60000);
  worker.onerror=e=>fail(e.message || 'Pogreška radnog procesa.');
  worker.onmessage=async({data})=>{
    if(id!==job)return;
    if(data.type==='progress'){$('status').textContent='Prevodim: '+data.tool;return;}
    if(data.type==='error'){fail(data.message);return;}
    try{
      if(data.type==='compiled'){
        await validateResult(input(),data.result);
        if(id!==job)return;
        result=data.result;end();$('run').disabled=false;
        $('status').textContent='Prevedeno lokalno. Spremno za simulaciju.';
        $('diagnostics').textContent=`Vrijeme: ${result.elapsedMs} ms\nFlash: ${result.flashBytes} B\nStatički SRAM: ${result.staticRamBytes} B\nHEX SHA-256: ${result.hexHash}\n\n${result.diagnostics.join('\n') || 'Bez pogrešaka.'}`;
      }else if(data.type==='simulated'){
        await validateResult(input(),result);
        if(id!==job)return;
        simulation=data.result;end();$('run').disabled=false;
        $('serial').textContent=simulation.serial || '(Program nema serijskog ispisa.)';
        const samples=simulation.samples, transitions=samples.filter((s,i)=>i&&s.level!==samples[i-1].level).length;
        $('transitions').textContent=`· ${transitions} promjena u 1,2 s`;$('led').classList.toggle('on',!!samples.at(-1)?.level);
        const ctx=$('wave').getContext('2d');ctx.clearRect(0,0,800,100);ctx.strokeStyle='#08796e';ctx.lineWidth=2;ctx.beginPath();
        samples.forEach((s,i)=>{const x=s.ms/1200*800,y=s.level?20:80;if(i){ctx.lineTo(x,samples[i-1].level?20:80);ctx.lineTo(x,y);}else ctx.moveTo(x,y);});ctx.stroke();
        $('status').textContent='Simulacija dovršena: izvršen je upravo prevedeni HEX.';
      }
    }catch(e){fail(e.message);}
  };
  worker.postMessage({type,input:snapshot,result});
}
$('compile').onclick=()=>runJob('compile');$('run').onclick=()=>runJob('simulate');
async function storageInfo(){try{const s=await navigator.storage.estimate();$('storage-info').textContent=`Zauzeto na ovoj adresi: ${(s.usage/1048576).toFixed(1)} MiB · kvota: ${(s.quota/1048576).toFixed(1)} MiB. Paket se čuva komprimiran.`;}catch{$('storage-info').textContent='Paket se čuva komprimiran.';}}
$('prepare').onclick=async()=>{
  $('prepare').disabled=true;$('compile').disabled=true;
  try {
    await shellReady;
    await installPackage((done,total)=>{$('progress').value=done/total;$('package-status').textContent=`Spremam prevoditelj: ${(done/1048576).toFixed(1)} / ${(total/1048576).toFixed(1)} MiB`;});
    ready=true;$('progress').value=1;$('package-status').textContent='Aplikacija i prevoditelj spremljeni su. Možeš isključiti mrežu.';
  }catch(e){ready=false;$('package-status').textContent=e.name==='QuotaExceededError'?'Nema dovoljno prostora u pregledniku. Projekt je sačuvan; pripremu paketa možeš nastaviti kada bude prostora.':e.message;}
  finally{$('prepare').disabled=false;$('compile').disabled=!ready||!!worker;await storageInfo();}
};
const network=()=>{$('network').textContent=navigator.onLine?'Mreža je uključena':'Mreža je isključena';};
window.addEventListener('online',network);window.addEventListener('offline',network);network();tabs();
const shellReady=(async()=>{
  if(!('serviceWorker' in navigator))throw Error('Ovaj preglednik ne podržava offline aplikaciju.');
  await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  await navigator.serviceWorker.ready;
})();
// Read-only evidence hook for repeatable prototype verification, never an execution shortcut.
window.labosPrototype={getState:()=>structuredClone({input:input(),result,simulation,ready,busy:!!worker})};
try{await shellReady;await packageStatus();ready=true;$('progress').value=1;$('package-status').textContent='Aplikacija i prevoditelj dostupni su iz spremljenog paketa.';}
catch(e){$('package-status').textContent=`Za prvi offline rad pripremi paket (${(PACKED_BYTES/1048576).toFixed(1)} MiB).`;}
$('compile').disabled=!ready;
await storageInfo();
