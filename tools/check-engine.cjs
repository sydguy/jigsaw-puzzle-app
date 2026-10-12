const assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const E = require('../src/game/engine.ts');
const { homePuzzle } = require('../src/game/record.ts');
const { rewardOnce } = require('../src/game/rewards.ts');
let seed=71593; const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
let actions=0, wrongFits=0, rejectedSwaps=0;
for(let side=5;side<=20;side++) for(const rotation of [false,true]) {
  const d=E.definition(side,rotation,'countdown',random); let a=E.newAttempt(d,'test',random);
  assert.equal(d.durationMs,Math.ceil(side*side*20/60)*60000);
  assert.equal(E.act(d,a,{type:'hint'},1),a,'ready state blocks gameplay');
  a=E.act(d,a,{type:'start'},1000);
  for(let step=0;step<1200;step++) {
    const piece=Math.floor(random()*side*side), slot=Math.floor(random()*side*side);
    const action=[{type:'select',piece},{type:'rotate'},{type:'place',piece,slot},{type:'return',piece},{type:'shuffle'},{type:'hint'}][Math.floor(random()*6)];
    const old=a; a=E.act(d,a,action,2000+step,random); E.validate(d,a); actions++;
    if(['select','rotate','shuffle'].includes(action.type)) assert.equal(a.moves,old.moves,'non-board action counts zero');
    if(action.type==='place' && old.board.includes(piece) && old.board[slot]!==null && a===old) rejectedSwaps++;
    if(action.type==='place' && a!==old && piece!==slot && E.complies(d,a,piece,slot)) wrongFits++;
    if(a.status==='completed') break;
  }
  // Repeated hints must always terminate at the exact solution, even after random legal play.
  for(let i=0;i<side*side*2 && a.status!=='completed';i++) { const before=a.moves; a=E.act(d,a,{type:'hint'},5000+i); assert.equal(a.moves,before+1); E.validate(d,a); }
  assert.equal(a.status,'completed'); assert.equal(E.correctCount(a),side*side);
  const replay=E.newAttempt(d,'replay',random); assert.equal(replay.moves,0); assert.equal(E.correctCount(replay),0); E.validate(d,replay);
  for(const mutate of [x=>x.board[0]=x.tray[0],x=>x.tray.push(x.tray[0]),x=>x.turns[0]=4,x=>x.selected=-1,x=>x.elapsedMs=-1,x=>x.status='completed']) {
    const bad=structuredClone(replay); mutate(bad); assert.throws(()=>E.validate(d,bad));
  }
}
assert.ok(wrongFits>0,'compatible wrong-home placements accepted'); assert.ok(rejectedSwaps>0,'illegal swaps rejected');
{
 const d=E.definition(20,false,'none');let a=E.act(d,E.newAttempt(d,'almost'),{type:'start'},1);
 assert.equal(E.advance(d,a,30000),a,'None does not run a hidden clock');
 for(let i=0;i<399;i++)a=E.act(d,a,{type:'place',piece:i,slot:i},2);
 assert.equal(homePuzzle({puzzle:{},definition:d,attempt:a,lastStartedAt:null}).progress,99,'399 of 400 is unfinished');
 const bad=structuredClone(a);bad.selected=0;[bad.board[0],bad.board[1]]=[bad.board[1],bad.board[0]];
 assert.throws(()=>E.validate(d,bad),'rotation-off selection cannot excuse incompatible placement');
}
// Regression: adjacent swap must use their FINAL mutual edge, not two empty source cells.
{
  const d=E.definition(5,false,'none',()=>.1); let a=E.act(d,E.newAttempt(d,'swap'),{type:'start'},1);
  // Make the final facing edges incompatible while either piece fits with both source cells empty.
  d.edges[7][1]=1; d.edges[8][3]=-1;
  a=E.act(d,a,{type:'place',piece:6,slot:6},2); a=E.act(d,a,{type:'place',piece:7,slot:7},3);
  const before=structuredClone(a); const b=E.act(d,a,{type:'place',piece:6,slot:7},4); E.validate(d,b);
  assert.equal(b,a,'reject adjacent swap with incompatible final mutual edges'); assert.equal(b.moves,2); assert.deepEqual(a,before,'engine never mutates input');
}
{
  const d=E.definition(5,true,'countdown',random); let a=E.act(d,E.newAttempt(d,'clock',random),{type:'start'},1);
  a=E.advance(d,a,1000); assert.equal(a.elapsedMs,1000);
  a=E.act(d,a,{type:'pause'},2); assert.equal(E.advance(d,a,100000).elapsedMs,1000);
  a=E.act(d,a,{type:'start'},3); a=E.advance(d,a,d.durationMs); assert.equal(a.status,'timeout'); assert.equal(a.elapsedMs,d.durationMs);
  assert.equal(E.act(d,a,{type:'hint'},4),a); a=E.act(d,a,{type:'untimed'},4); assert.equal(a.status,'paused'); assert.equal(a.continuedUntimed,true);
  a=E.act(d,a,{type:'start'},5); a=E.advance(d,a,30000); assert.equal(a.status,'running'); E.validate(d,a);
  const invalid=structuredClone(d); invalid.edges[0][0]=1; assert.throws(()=>E.validate(invalid,a));
  for(const bad of [0,4,21,NaN,Infinity,5.5]) assert.throws(()=>E.definition(bad,false,'none'));
}
(async()=>{ let granted=0; const cancelled=rewardOnce(async()=>{granted++}); await cancelled('cancelled'); await cancelled('completed'); assert.equal(granted,0,'late completion cannot undo cancellation');
 for(const outcome of ['unavailable','completed','technical-failure']){const grant=rewardOnce(async()=>{granted++});await Promise.all([grant(outcome),grant(outcome),grant('completed')]);} assert.equal(granted,3,'each distinct supported result grants once');
 console.log(`PASS: ${actions} random actions across 32 configurations; exact hints/completion, swaps, wrong-home compatibility, partition, bounds, corruption, clocks and single rewards.`); })().catch(e=>{console.error(e);process.exitCode=1});
