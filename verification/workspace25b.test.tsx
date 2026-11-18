import React,{act} from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import {JSDOM} from 'jsdom';
import {createRoot} from 'react-dom/client';
import {UrsCatalog} from '../src/lessons/UrsPanel';
import SchoolWork from '../src/platform/SchoolWork';
import {prepareSchoolAttempt,type SchoolWorkState} from '../src/platform/schoolSync';

function environment(t:any){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://school.test/',pretendToBeVisual:true});
 const prior={window:globalThis.window,document:globalThis.document,location:globalThis.location,fetch:globalThis.fetch,IS_REACT_ACT_ENVIRONMENT:(globalThis as any).IS_REACT_ACT_ENVIRONMENT};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,location:dom.window.location,IS_REACT_ACT_ENVIRONMENT:true});
 const root=createRoot(document.getElementById('root')!);
 t.after(async()=>{await act(async()=>root.unmount());Object.assign(globalThis,prior);dom.window.close();});
 return {root,dom};
}
test('25B variant preview does not open or mutate work; changing target clears the previous choice',async t=>{
 const {root,dom}=environment(t),calls:any[]=[];
 await act(async()=>root.render(<UrsCatalog busy={false} initialTarget="micropython" open={(...args)=>calls.push(args)}/>));
 const button=(text:string)=>[...document.querySelectorAll('button')].find(e=>e.textContent===text)!;
 await act(async()=>button('Pregled · LED i čekanje').click());
 assert.equal(calls.length,0);assert.match(document.querySelector('.variant-preview')!.textContent!,/zatvoren LED krug/);
 assert.match(document.querySelector('.variant-preview')!.textContent!,/LED i otpornik/);
 await act(async()=>button('Otvori vježbu · LED i čekanje').click());
 assert.deepEqual(calls,[['gpio','blink','micropython','uno']]);
 await act(async()=>{const target=document.querySelector('select')!;target.value='uno';target.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
 assert.equal(document.querySelector('.variant-preview'),null);assert.equal(calls.length,1);
 await act(async()=>button('Pregled · LED i čekanje').click());
 await act(async()=>button('Otvori vježbu · LED i čekanje').click());
 assert.equal(calls[1][2],'uno');
});
test('25B compact school work preserves points and revision, automatically exposes save errors and recovery',async t=>{
 const {root}=environment(t);
 const project=JSON.parse(readFileSync('.build/school-catalog/gpio-button-micropython.json','utf8'));
 const work:SchoolWorkState={attempt:{id:1,assignmentId:2,studentId:3,number:1,status:'in_progress',revision:2,savedAt:'2026-11-18T12:00:00Z'},student:{id:3,username:'test',displayName:'Probni učenik'},assignment:{id:2,className:'4.f',task:{version:1,definition:{code:'URS01'}}},snapshot:{revision:2,project,contentHash:'a'.repeat(64),savedAt:'2026-11-18T12:00:00Z'}};
 const local=await prepareSchoolAttempt(work);let fail=false;
 globalThis.fetch=async(input:any)=>{
  const action=new URL(String(input),'https://school.test').searchParams.get('action');
  if(fail)throw Error('Nema veze sa školskim poslužiteljem.');
  const json=(v:any)=>new Response(JSON.stringify({application:'labosv2',csrfToken:'csrf',...v}));
  if(action==='session')return json({user:{id:3,role:'student',mustChangePassword:false},features:{centralStorage:true,submissions:true}});
  if(action==='attempt')return json(work);
  if(action==='grading')return json({grading:{status:'evaluated',points:7,maxPoints:10,revision:2}});
  throw Error('Unexpected '+action);
 };
 const render=async(key:string)=>act(async()=>{root.render(<SchoolWork key={key} project={local} expanded={false} confirm={()=>{}} open={async()=>{}}/>);await delay(30);});
 await render('saved');await act(async()=>{await delay(30);});
 assert.match(document.querySelector('.school-sync-top')!.textContent!,/Spremljeno na školskom poslužitelju/);
 assert(document.querySelector<HTMLElement>('#my-work')!.hidden);
 assert.match(document.querySelector('.school-grade-result')?.textContent??document.querySelector('.school-grading')!.textContent!,/7 \/ 10 potvrđenih bodova/);
 fail=true;await render('offline');await act(async()=>{await delay(30);});
 assert.equal(document.querySelector<HTMLElement>('#my-work')!.hidden,false);
 assert.match(document.querySelector('.school-sync-top')!.textContent!,/Nema veze/);
 const retry=[...document.querySelectorAll('button')].find(b=>b.textContent==='Spremi sada / ponovi');assert(retry&&!retry.disabled);
 fail=false;work.attempt.status='locked';work.submission={id:9,attemptId:1,revision:2,contentHash:'a'.repeat(64),submittedAt:'2026-11-18T12:02:00Z'};
 await render('locked');await act(async()=>{await delay(30);});
 assert.equal(document.querySelector<HTMLElement>('#my-work')!.hidden,false);
 assert.match(document.querySelector('.school-sync-top')!.textContent!,/zaključana/);
 assert(document.querySelector('.school-locked-submission'));
 assert(![...document.querySelectorAll('button')].some(b=>b.textContent==='Završi i zaključaj vježbu'));

});
