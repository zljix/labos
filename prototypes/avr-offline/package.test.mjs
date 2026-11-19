import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installPackage,readPackage,packageStatus,decodeResponse,FILES,CACHE,assetURL} from './package.mjs';
test('partial raw package converts in place and resumes under 50 MiB without deleting caches',async()=>{
  const previous={self:globalThis.self,caches:globalThis.caches,fetch:globalThis.fetch};
  globalThis.self={location:{href:'https://prototype/index.html'}};
  const entries=new Map(), requests=[];let bytes=0;
  const cache={
    match:async key=>entries.get(key)?.clone(),
    put:async(key,response)=>{
      const copy=response.clone(),length=(await copy.arrayBuffer()).byteLength;
      const old=entries.has(key)?(await entries.get(key).clone().arrayBuffer()).byteLength:0;
      if(bytes-old+length>50*1048576)throw new DOMException('Quota exceeded','QuotaExceededError');
      entries.set(key,response.clone());bytes+=length-old;
    },
    delete:()=>{throw Error('Must not delete entries');}
  };
  globalThis.caches={open:async name=>{assert.equal(name,CACHE);return cache;},delete:()=>{throw Error('Must not delete caches');}};
  globalThis.fetch=async url=>{requests.push(url);assert(url.endsWith('.gz'));return new Response(await readFile('.build/avr-offline/toolchain/'+url.split('/').pop()));};
  try{
    await cache.put('unrelated-sentinel',new Response('preserve'));
    for(const name of Object.keys(FILES).filter(n=>n!=='sdk.bin'))await cache.put(assetURL(name),new Response(await readFile('.build/avr-toolchain/'+name)));
    const initial=bytes;assert(initial>35*1048576);
    await installPackage();await packageStatus();const result=await readPackage();
    assert.equal(result.size,Object.keys(FILES).length);assert(bytes<20*1048576);
    assert.deepEqual(requests,['https://prototype/toolchain/sdk.bin.gz']);
    assert.equal(await (await cache.match('unrelated-sentinel')).text(),'preserve');
    assert.equal(entries.get(assetURL('cc1plus.js')).headers.get('X-Labos-Compression'),'gzip');
    globalThis.fetch=()=>{throw Error('No network when complete');};await installPackage();await readPackage();
    console.log(JSON.stringify({initialBytes:initial,finalBytes:bytes,onlyDownloaded:'sdk.bin.gz',deletes:0}));
  }finally{Object.assign(globalThis,previous);}
});
test('compressed corruption and expanded payload limits are rejected',async()=>{
  await assert.rejects(()=>decodeResponse('cc1.js',new Response('broken',{headers:{'X-Labos-Compression':'gzip'}})));
  const huge=new Uint8Array(FILES['cc1.js'].bytes+1);
  const zipped=await new Response(new Blob([huge]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
  await assert.rejects(()=>decodeResponse('cc1.js',new Response(zipped,{headers:{'X-Labos-Compression':'gzip'}})),/veličinu/);
});
