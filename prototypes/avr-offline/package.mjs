import upstream from './upstream-manifest.json' with {type:'json'};
import {sha256} from '../../public/avr-contract.mjs';
export const FILES = Object.fromEntries(Object.entries(upstream.files).filter(([name])=>name!=='ctags.js'));
export const CACHE = 'labos-avr-prototype-1-'+FILES['sdk.bin'].sha256.slice(0,12);
export const assetURL = name => new URL('toolchain/'+name, self.location.href).href;
export async function verifyBytes(name,bytes) {
  const expected=FILES[name];
  if(!expected || bytes.byteLength!==expected.bytes || await sha256(bytes)!==expected.sha256)throw Error('Oštećena ili nepotpuna datoteka prevoditelja: '+name);
  return bytes;
}
export async function packageStatus(progress=()=>{}) {
  const cache=await caches.open(CACHE); let total=0;
  for(const name of Object.keys(FILES)) {
    const response=await cache.match(assetURL(name));
    if(!response)throw Error('Paket još nije spremljen: '+name);
    await verifyBytes(name,await response.arrayBuffer()); total++; progress(total,Object.keys(FILES).length);
  }
  return true;
}
export async function installPackage(progress=()=>{}) {
  const cache=await caches.open(CACHE); let done=0;
  for(const [name,metadata] of Object.entries(FILES)) {
    const url=assetURL(name), previous=await cache.match(url);
    let valid=false;
    if(previous)try{await verifyBytes(name,await previous.arrayBuffer());valid=true;}catch{}
    if(!valid) {
      const response=await fetch(url,{cache:'no-store'});
      if(!response.ok)throw Error('Preuzimanje nije uspjelo: '+name);
      const bytes=await verifyBytes(name,await response.arrayBuffer());
      await cache.put(url,new Response(bytes,{headers:{'Content-Type':name.endsWith('.wasm')?'application/wasm':name.endsWith('.js')?'text/javascript':'application/octet-stream'}}));
    }
    done+=metadata.bytes; progress(done,Object.values(FILES).reduce((n,f)=>n+f.bytes,0));
  }
  // No ready flag: every compile verifies every byte it uses, including after browser eviction.
  await packageStatus();
}
export async function readPackage() {
  const cache=await caches.open(CACHE), files=new Map();
  for(const name of Object.keys(FILES)) {
    const response=await cache.match(assetURL(name));
    if(!response)throw Error('Nedostaje offline paket. Pritisni Pripremi paket dok si na mreži.');
    files.set(name,await verifyBytes(name,await response.arrayBuffer()));
  }
  return files;
}
