import test from 'node:test';
import assert from 'node:assert/strict';
import {S3,UNO,NANO} from '../src/boards/profiles';
import {demoCircuit,emptyCircuit,makePart,terminalMap,keyOf,wirePoints,type Circuit} from '../src/circuit/model';
import {routeCircuit,routedPath,partBounds,layoutBounds} from '../src/circuit/routing';
import {buildNets} from '../src/circuit/netlist';
import {environmentCircuit,environmentExamples,type EnvironmentExample} from '../src/circuit/environmentExamples';
import {peripheralCircuit} from '../src/circuit/peripheralExamples';
import {sdCircuit} from '../src/circuit/sdExamples';
import {rtcCircuit} from '../src/circuit/rtcExamples';
import {opticalCircuit} from '../src/circuit/max30102Examples';

function endpoints(c:Circuit,l=routeCircuit(c)){
 const map=terminalMap(c);for(const w of c.wires){const points=l.paths.get(w.id)!;assert.deepEqual(points[0],{x:map.get(keyOf(w.from))!.x,y:map.get(keyOf(w.from))!.y});assert.deepEqual(points.at(-1),{x:map.get(keyOf(w.to))!.x,y:map.get(keyOf(w.to))!.y});}
}
test('automatic paths preserve topology, input data and exact connector positions',()=>{
 const c=demoCircuit(),before=structuredClone(c),nets=[...buildNets(c).byTerminal].map(([k,n])=>[k,n.id]),l=routeCircuit(c);assert.equal(l.overlaps,0);assert.deepEqual(l.blocked,[]);endpoints(c,l);assert.deepEqual(c,before);assert.deepEqual([...buildNets(c).byTerminal].map(([k,n])=>[k,n.id]),nets);assert.deepEqual([...routeCircuit(c).paths],[...l.paths]);
});
test('manual bends remain fixed and their overlaps are reported for the arrange button',()=>{
 const c=demoCircuit();for(const w of c.wires.slice(0,2))w.points=[{x:330,y:140},{x:330,y:400}];const l=routeCircuit(c);assert.deepEqual(l.paths.get(c.wires[0].id),wirePoints(c.wires[0],terminalMap(c)));assert.ok(l.overlaps>0);
 for(const w of c.wires)w.points=[];assert.equal(routeCircuit(c).overlaps,0);
});
test('movement, rotation and viewport fitting include new endpoints and outer channels',()=>{
 const c=demoCircuit();c.components[0].rotation=90;c.components[0].x=-300;c.components[0].y=-250;const l=routeCircuit(c);endpoints(c,l);const bounds=layoutBounds(c,l);for(const p of [...l.paths.values()].flat()){assert.ok(p.x>=bounds.x&&p.x<=bounds.x+bounds.width);assert.ok(p.y>=bounds.y&&p.y<=bounds.y+bounds.height);}const b=partBounds(c.components[0]);assert.equal(b.right-b.left,540);assert.equal(b.bottom-b.top,200);
});
test('crossings have bridges without introducing electrical joints',()=>{
 const c=emptyCircuit();c.components.push(makePart('resistor',400,100,'r1'),makePart('resistor',400,300,'r2'));
 c.wires=[{id:'a',from:{component:'r1',pin:'1'},to:{component:'r2',pin:'2'},color:'#087f8c',points:[{x:300,y:135},{x:300,y:335}]},{id:'b',from:{component:'r1',pin:'2'},to:{component:'r2',pin:'1'},color:'#334155',points:[{x:600,y:135},{x:600,y:235},{x:250,y:235},{x:250,y:335}]}];
 const l=routeCircuit(c);assert.ok(l.crossings.length);assert.match(routedPath(l.paths.get('b')!,l.crossings.filter(x=>x.second==='b').map(x=>x.point)),/Q/);assert.ok(!buildNets(c).connected(c.wires[0].from,c.wires[1].from));
});
test('a blocked connector is reported instead of claiming successful routing',()=>{
 const c=demoCircuit();c.components.push(makePart('lcd1602',-130,100,'blocking'));assert.ok(routeCircuit(c).blocked.length);
});
// Exercise each distinct factory geometry once per board, rather than repeat
// examples whose only difference is program text or initial sensor values.
for(const board of [S3,UNO,NANO]as const)test(`built-in diagrams have separate trace channels · ${board}`,()=>{
 const seen=new Set<string>();let checked=0;
 for(const key of Object.keys(environmentExamples)as EnvironmentExample[]){const c=environmentCircuit(key,board),sig=JSON.stringify({parts:c.components.map(p=>[p.kind,p.x,p.y,p.rotation]),wires:c.wires.map(w=>[w.from,w.to])});if(seen.has(sig))continue;seen.add(sig);const l=routeCircuit(c);assert.equal(l.overlaps,0,key);assert.deepEqual(l.blocked,[],key);endpoints(c,l);checked++;}
 for(const c of [sdCircuit('sdLogger',board),rtcCircuit('rtcClock',board),opticalCircuit('opticalRaw',board)]){const l=routeCircuit(c);assert.equal(l.overlaps,0);assert.deepEqual(l.blocked,[]);endpoints(c,l);}
 assert.ok(checked>20);
});
test('AHT10, OLED and servo example has no overlapping trace segments',()=>{const c=peripheralCircuit(),l=routeCircuit(c);assert.equal(l.overlaps,0);assert.deepEqual(l.blocked,[]);endpoints(c,l);});
