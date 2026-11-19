import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile,access,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
const here=dirname(fileURLToPath(import.meta.url)), root=resolve(here,'../..');
const output=resolve(root,'.build/avr-offline'), assets=resolve(root,'.build/avr-toolchain');
await mkdir(output+'/toolchain',{recursive:true});await mkdir(assets,{recursive:true});
const upstream=JSON.parse(await readFile(here+'/upstream-manifest.json','utf8'));
const names=Object.keys(upstream.files).filter(n=>n!=='ctags.js');
const packed={};
for(const name of names){
  const metadata=upstream.files[name], path=assets+'/'+name;
  let valid=false;
  try{const bytes=await readFile(path);valid=bytes.length===metadata.bytes&&createHash('sha256').update(bytes).digest('hex')===metadata.sha256;}catch{}
  if(!valid){
    console.log('Download:',name);
    // curl respects the workspace network proxy; source and digest are pinned.
    const r=spawnSync('curl',['-fsSL','--retry','2','--max-time','120','https://github.com/pcbkit-io/toolchain/releases/download/'+upstream.id+'/'+name,'-o',path+'.part'],{stdio:'inherit'});
    if(r.status!==0)throw Error('Download failed: '+name);
    const bytes=await readFile(path+'.part');
    if(bytes.length!==metadata.bytes||createHash('sha256').update(bytes).digest('hex')!==metadata.sha256)throw Error('Integrity failed: '+name);
    await writeFile(path,bytes);
  }
  // The distributable only needs compressed bytes. Keep the raw build cache
  // in .build/avr-toolchain, not a second public copy in the application.
  await unlink(output+'/toolchain/'+name).catch(e=>{if(e.code!=='ENOENT')throw e;});
  const compressed=gzipSync(await readFile(path),{level:9});
  await writeFile(output+'/toolchain/'+name+'.gz',compressed);
  packed[name]={bytes:compressed.length};
}
await writeFile(here+'/packed-manifest.json',JSON.stringify(packed,null,2)+'\n');
// Notices and licences are fetched from the exact upstream release, outside the app bundle.
for(const name of ['NOTICE.json','licenses.tar.gz']){
  const path=assets+'/'+name;
  try{await access(path);}catch{
    const r=spawnSync('curl',['-fsSL','--retry','2','--max-time','60','https://github.com/pcbkit-io/toolchain/releases/download/'+upstream.id+'/'+name,'-o',path],{stdio:'inherit'});
    if(r.status!==0)throw Error('Missing licence material: '+name);
  }
  await copyFile(path,output+'/toolchain/'+name);
}
const shared={bundle:true,platform:'browser',target:'es2022',define:{__APP_BUILD__:'"prototype"',__APP_BASE__:'"./"',__APP_VERSION__:'"0.15.7-prototype.1"'},logLevel:'warning'};
await build({...shared,entryPoints:[here+'/app.mjs'],format:'esm',outfile:output+'/app.js'});
await build({...shared,entryPoints:[here+'/worker.ts'],format:'iife',outfile:output+'/worker.js'});
for(const name of ['index.html','style.css','README.md'])await copyFile(here+'/'+name,output+'/'+name);
await copyFile(here+'/upstream-manifest.json',output+'/toolchain/manifest.json');
const shell=['index.html','app.js','worker.js','style.css','README.md','toolchain/NOTICE.json'];
const hash=createHash('sha256');for(const name of shell)hash.update(await readFile(output+'/'+name));
const cache='labos-avr-prototype-shell-'+hash.digest('hex').slice(0,16);
await writeFile(output+'/sw.js',`const CACHE=${JSON.stringify(cache)}, FILES=${JSON.stringify(shell)};
self.addEventListener('install',e=>e.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES.map(p=>new URL(p,self.registration.scope).href));await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||!url.href.startsWith(self.registration.scope))return;const relative=url.href.slice(self.registration.scope.length).split('?')[0];if(relative!==''&&!FILES.includes(relative))return;e.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(new URL(relative||'index.html',self.registration.scope).href);return hit||fetch(e.request);})());});
`);
console.log('Prototype built:',output);
