import {validateResult} from './compiler.mjs';
import {AVREngine} from '../../src/runtime/avrEngine';
import {compileCircuit} from '../../src/circuit/compile';
import {arduinoExampleProject} from '../../src/runtime/arduinoExamples';
import {UNO,NANO} from '../../src/boards/profiles';

export async function simulate(input:any,result:any) {
  await validateResult(input,result);
  const project=arduinoExampleProject('blink',input.board==='nano'?NANO:UNO), events:any[]=[];
  const engine=new AVREngine(result.hex,compileCircuit(project.circuit as any,'avr'),e=>events.push(e),input.board==='nano'?8:6,result.staticRamBytes);
  try {
    // Bounded deterministic proof: 1.2 seconds of simulated AVR time.
    for(let ms=0;ms<1200;ms+=4){engine.runCycles(64000);engine.frame();}
    const frames=events.filter(e=>e.type==='simulation');
    return {serial:events.filter(e=>e.type==='console').map(e=>e.text).join(''),samples:frames.map((e,i)=>({ms:i*4,level:e.gpios?.['13']?.level??0,ledCurrentMa:e.leds?.led1?.currentMa??0})),faults:events.filter(e=>e.type==='error')};
  }finally{engine.dispose();}
}
