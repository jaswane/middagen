import fs from 'node:fs';
import assert from 'node:assert/strict';
import { load } from './test-support.mjs';
const meals=JSON.parse(fs.readFileSync('lib/meals.json','utf8'));
// Match the client payload: recipe-only fields are intentionally omitted.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const summaries=meals.map(({ingredients,instructions,tip,pantryIngredients,baseServings,...m})=>m);
const {filterMeals,matchIngredient,suggest}=load('lib/engine.ts');
const {initialDecision,showDecision,refreshDecision,decideDinner,undoDinner,serializeDecision,restoreDecision}=load('lib/decision.ts');
const {formatPortion}=load('lib/portions.ts');
const all={time:'all',type:'all',price:'all'};
const same=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
let checks=0;
function test(name,fn){fn();checks++;console.log(`PASS ${name}`);}
function search(word){const match=matchIngredient(word,summaries);return match.intent?filterMeals(summaries,{...all,type:match.intent}):match.ingredient?filterMeals(summaries,all,match.ingredient):[];}

test('all 20 requested searches have explicit results; salt stays unmatched',()=>{
 const counts={kylling:3,kyllingfilet:2,'kjøttdeig':4,laks:3,torsk:3,pasta:10,spagetti:7,spaghetti:7,potet:9,poteter:9,egg:7,'pølse':3,'pølser':3,sopp:3,'bønne':6,'bønner':6,vegetar:20,vegetarisk:20,salt:0,salat:2};
 for(const [word,count] of Object.entries(counts))assert.equal(search(word).length,count,word);
});
test('normalisation, safe aliases and explicit typo list',()=>{
 for(const word of ['  JeG   HAR  KYLLING  ','kyling','kyllign','chicken'])same(search(word).map(m=>m.id),search('kylling').map(m=>m.id));
 for(const [word,canonical] of [['kjottdeig','kjøttdeig'],['kjøtdeig','kjøttdeig'],['lask','laks'],['potetr','poteter'],['past','pasta'],['kyllingbryst','kyllingfilet'],['pølSe','pølser']])same(search(word).map(m=>m.id),search(canonical).map(m=>m.id));
});
test('forms never widen to unsuitable recipes',()=>{
 assert.ok(search('kyllingfilet').every(m=>m.id!=='ovnskylling-med-rotgronnsaker'));
 same(search('kyllinglår').map(m=>m.id),['ovnskylling-med-rotgronnsaker']);
 assert.ok(search('spaghetti').every(m=>!['spinatlasagne','tomatsuppe','polsegrateng'].includes(m.id)));
 same(search('lasagneplater').map(m=>m.id),['spinatlasagne']);
});
test('vegetarian intent is explicit and animal-free; null never fabricates a match',()=>{
 assert.equal(matchIngredient('vegetar',summaries).intent,'vegetar');
 assert.ok(search('vegetarisk').every(m=>m.category==='vegetar'));
 for(const word of ['salt','','banan','kylling og laks','saltt','<script>'])assert.equal(search(word).length,0,word);
 assert.equal(matchIngredient('salt',summaries).corrected,false);
});
for(const mode of ['instant','guided','ingredient'])test(`exact ${mode} decision survives recipe return, including refresh history`,()=>{
 const filters=mode==='guided'?{time:'30',type:'vegetar',price:'billig'}:all;
 const ingredient=mode==='ingredient'?'pasta':null;
 let state=showDecision({...initialDecision(),filters,query:ingredient??'',searched:ingredient??''},filterMeals(summaries,filters,ingredient),mode,filters,ingredient,41);
 state=refreshDecision(state);
 const restored=restoreDecision(serializeDecision(state,summaries,460),summaries);
 same(restored.state,state);assert.equal(restored.scrollY,460);
 same(refreshDecision(restored.state),refreshDecision(state));
});
test('decide + recipe return + undo restores the exact three and their history',()=>{
 const before=refreshDecision(showDecision(initialDecision(),summaries,'instant',all,null,25));
 const single=decideDinner(before);assert.equal(single.results.length,1);
 const restored=restoreDecision(serializeDecision(single,summaries,190),summaries).state;
 same(undoDinner(restored),before);
 same(refreshDecision(undoDinner(restored)),refreshDecision(before));
});
test('zero/one/two results and unfinished forms round-trip',()=>{
 for(const n of [0,1,2]){
  const state=showDecision(initialDecision(),summaries.slice(0,n),'guided');
  same(restoreDecision(serializeDecision(state,summaries),summaries).state,state);
 }
 const form={...initialDecision(),mode:'ingredient',query:'kyllingfilet'};
 same(restoreDecision(serializeDecision(form,summaries),summaries).state,form);
});
test('corrupt, old, changed-data and invalid stored state are discarded safely',()=>{
 const state=showDecision(initialDecision(),summaries,'instant');const raw=serializeDecision(state,summaries);
 for(const bad of [null,'broken','{}',raw.replace('"version":1','"version":0'),raw.replace('"round":','"round":"oops","ignored":')])assert.equal(restoreDecision(bad,summaries),null);
 assert.equal(restoreDecision(raw,summaries.slice(1)),null);
 const damaged=JSON.parse(raw);damaged.state.results=['not-a-meal'];assert.equal(restoreDecision(JSON.stringify(damaged),summaries),null);
});
test('all legacy 54 combinations remain strict; all current 36 combinations covered',()=>{
 let tested=0;
 for(const time of ['all','15','30'])for(const type of ['all','familie','kjott','fisk','vegetar','lett'])for(const price of ['all','billig','vanlig']){
  const pool=filterMeals(summaries,{time,type,price});
  for(const m of suggest(pool,25)){
   assert.ok(time==='all'||m.timeMinutes<=Number(time));
   assert.ok(type==='all'||type==='familie'&&m.familyFriendly||type==='lett'&&m.mealTags.includes('lett')||m.category===type);
   assert.ok(price==='all'||price==='billig'&&m.costTier==='billig'||price==='vanlig'&&m.costTier!=='litt-ekstra');
  }tested++;
 }assert.equal(tested,54);
});
test('within-category sets avoid three chickens or three pasta dishes when alternatives exist',()=>{
 const meat=filterMeals(summaries,{...all,type:'kjott'});
 for(let seed=0;seed<500;seed++){
  const picked=suggest(meat,seed);
  assert.ok(!picked.every(m=>m.mainIngredients.includes('kylling')),String(seed));
  assert.ok(!picked.every(m=>m.mainIngredients.includes('pasta')),String(seed));
  assert.ok(new Set(suggest(summaries,seed).map(m=>m.category)).size===3);
 }
});
test('unseen relevance outranks variety; repeated refreshes use available unseen meals',()=>{
 const chicken=search('kylling');same(suggest(chicken,12).map(m=>m.id).sort(),chicken.map(m=>m.id).sort());
 const excluded=summaries.filter(m=>!chicken.some(c=>c.id===m.id)).map(m=>m.id);
 assert.ok(suggest(summaries,3,excluded).every(m=>m.mainIngredients.includes('kylling')));
 let state=showDecision(initialDecision(),summaries,'instant',all,null,4);
 for(let i=0;i<35;i++){
  const unseen=state.pool.filter(m=>!state.seen.includes(m.id));const next=refreshDecision(state);
  assert.equal(new Set(next.results.map(m=>m.id)).size,3);
  assert.ok(next.results.every(m=>!state.results.some(c=>c.id===m.id)));
  if(unseen.length>=3)assert.ok(next.results.every(m=>!state.seen.includes(m.id)));
  state=next;
 }
});
test('preparation method breaks otherwise equal candidates',()=>{
 const sample=summaries[0];
 const candidates=['stekepanne','stekeovn','kasserolle'].flatMap((method,i)=>[0,1].map(j=>({...sample,id:`method-${i}-${j}`,equipmentTags:[method]})));
 for(let seed=0;seed<50;seed++)assert.equal(new Set(suggest(candidates,seed).map(m=>m.equipmentTags[0])).size,3);
});
test('kitchen quantities use original values, fractions, explicit bounds and marked rounding',()=>{
 const f=(quantity,unit,servings=1,name='test')=>formatPortion({name,quantity,unit},servings,4);
 assert.equal(f(.5,'stk'),'1/8 stk');assert.equal(f(.25,'ts'),'under 1/8 ts');
 assert.equal(f(1,'stk',6),'1 1/2 stk');assert.equal(f(1,'ss'),'1/4 ss');
 assert.equal(f(.5,'ss'),'3/8 ts');assert.equal(f(350,'g'),'ca. 88 g');
 assert.equal(f(750,'g'),'ca. 190 g');assert.equal(f(1,'kg'),'250 g');
 assert.equal(f(2,'dl'),'50 ml');assert.equal(f(1,'l'),'250 ml');
 assert.equal(f(1,'boks'),'1/4 boks');assert.equal(f(1,'pakke'),'1/4 pakke');
 assert.equal(f(1,'klype'),'under 1 klype');
 assert.equal(f(1,'g'),'under 0,5 g');
 assert.equal(f(null,'etter smak'),'etter smak');
 for(const m of meals)for(const i of m.ingredients)for(const servings of [1,2,3,4,6,8]){
  const original=JSON.stringify(i);const out=formatPortion(i,servings,4);assert.ok(out.length>0&&!out.includes('NaN'));assert.equal(JSON.stringify(i),original);
 }
});
test('targeted time corrections and prerequisites are visible in summary data',()=>{
 for(const [id,time] of [['soppomelett',20],['kyllingfajitas',35],['ovnskylling-med-rotgronnsaker',60]])assert.equal(meals.find(m=>m.id===id).timeMinutes,time);
 for(const id of ['ost-og-bonnequesadillas','stekt-ris-med-egg','rekenudler','tunfiskpasta','pestopasta-med-erter'])assert.ok(summaries.find(m=>m.id===id).timeNote);
 assert.equal(meals.length,42);
});
console.log(JSON.stringify({checks,recipes:meals.length,quick15:meals.filter(m=>m.timeMinutes<=15).length,quick30:meals.filter(m=>m.timeMinutes<=30).length}));
