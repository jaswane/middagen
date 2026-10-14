import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {load} from './test-support.mjs';

const meals=JSON.parse(fs.readFileSync('lib/meals.json','utf8'));
const old=meals.slice(0,42), added=meals.slice(42);
const {filterMeals,matchIngredient,suggest}=load('lib/engine.ts');
const {initialDecision,showDecision,refreshDecision}=load('lib/decision.ts');
const {formatPortion}=load('lib/portions.ts');
const all={time:'all',type:'all',price:'all'};
const ids=rows=>rows.map(m=>m.id).sort();
const search=q=>{const m=matchIngredient(q,meals);return m.intent?filterMeals(meals,{...all,type:m.intent}):m.ingredient?filterMeals(meals,all,m.ingredient):[];};
const newSearch=q=>search(q).filter(m=>added.some(n=>n.id===m.id));
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}

test('42 published recipes remain byte-for-byte equivalent as JSON values',()=>{
 assert.equal(meals.length,62);
 assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),'505074d6e764ae19d97a2e825bc6914259b1f319a7576ca440d04c82ece5004d');
 assert.equal(added.length,20);
 assert.equal(new Set(meals.map(m=>m.title.toLocaleLowerCase('nb'))).size,62);
});
test('raw and ready-made proteins stay separate in ingredient search',()=>{
 assert.deepEqual(ids(newSearch('kyllingfilet')),['kylling-med-sopp-og-ris','kylling-og-nudelsuppe','kylling-og-ris-i-en-gryte'].sort());
 assert.deepEqual(ids(search('ferdigstekt kylling')),['pita-med-ferdigstekt-kylling']);
 assert.deepEqual(ids(search('karbonader')),['karbonader-med-potetmos']);
 assert.ok(!search('kjøttdeig').some(m=>m.id==='karbonader-med-potetmos'));
 assert.ok(!search('kyllingfilet').some(m=>m.id==='pita-med-ferdigstekt-kylling'));
});
test('egg and bread binders do not turn fish gratin into an ingredient-search match',()=>{
 assert.ok(!search('egg').some(m=>m.id==='fiskegrateng-med-makaroni'));
 assert.ok(!search('brød').some(m=>m.id==='fiskegrateng-med-makaroni'));
 assert.deepEqual(ids(newSearch('egg')),['kikertpanne-med-brokkoli-og-egg','pannekaker-med-spinat']);
 assert.ok(meals.find(m=>m.id==='fiskegrateng-med-makaroni').ingredients.some(i=>i.name==='egg'));
});
test('new fish, cabbage and lentil forms map to their actual recipes',()=>{
 assert.equal(search('sei').length,3);
 assert.deepEqual(ids(search('sei')),ids(search('seifilet')));
 assert.equal(search('kål').length,3);
 assert.deepEqual(ids(search('kål')),ids(search('hodekål')));
 assert.deepEqual(ids(search('linser')).sort(),['linsegryte-med-sopp','rod-linsesuppe'].sort());
 assert.deepEqual(ids(search('ferdigkokte grønne linser')),['linsegryte-med-sopp']);
 for(const q of ['tørre grønne linser','rå kyllinglår','rå karbonader'])assert.equal(search(q).length,0,q);
});
test('time-sensitive ingredients and cooking conditions survive the summary payload',()=>{
 for(const m of added){
  assert.ok(m.timeNote.length>20,m.id);
  assert.ok(['enkel','middels'].includes(m.difficulty),m.id);
  assert.equal(m.baseServings,4);
  for(const [family,forms] of Object.entries(m.ingredientForms??{})){
   assert.ok([...m.mainIngredients,...m.secondaryIngredients].includes(family),m.id+': '+family);
   assert.ok(forms.length>0 && new Set(forms).size===forms.length,m.id);
  }
 }
 const quick=added.filter(m=>m.timeMinutes<=15);
 assert.deepEqual(ids(quick),['fiskeburger-med-kalsalat','polse-og-bonnegryte','polser-i-lompe-med-kalsalat'].sort());
 for(const m of quick)assert.match(m.timeNote,/ferdig/i,m.id);
 for(const m of added)for(const ingredient of m.ingredients)for(const portions of [1,2,3,4,6,8]){
  const scaled=formatPortion(ingredient,portions,m.baseServings);
  assert.ok(scaled.length>0 && !/NaN|undefined|Infinity/.test(scaled),m.id);
 }
});
test('all 36 current filter combinations have honest results and no hidden relaxation',()=>{
 for(const time of ['all','15','30'])for(const type of ['all','kjott','fisk','vegetar'])for(const price of ['all','billig','vanlig']){
  const f={time,type,price},pool=filterMeals(meals,f),selected=suggest(pool,7);
  assert.ok(pool.length>0,JSON.stringify(f));
  assert.equal(selected.length,Math.min(3,pool.length));
  for(const m of selected){
   assert.ok(time==='all'||m.timeMinutes<=Number(time));
   assert.ok(type==='all'||m.category===type);
   assert.ok(price==='all'||(price==='billig'?m.costTier==='billig':m.costTier!=='litt-ekstra'));
  }
 }
});
test('refresh explores available unseen recipes across seven requested pools and the actual instant pool',()=>{
 const cases=[all,{...all,time:'45'},{...all,type:'kjott'},{...all,type:'fisk'},{...all,type:'vegetar'},{...all,time:'15'},{...all,time:'30'},{...all,price:'billig'}];
 for(const filters of cases){
  const pool=filterMeals(meals,filters);
  for(let seed=0;seed<50;seed++){
   let state=showDecision(initialDecision(),pool,'guided',filters,null,seed);
   const encountered=new Set(state.results.map(m=>m.id));
   for(let round=0;round<Math.ceil(pool.length/3)+2;round++){
    const unseen=pool.filter(m=>!state.seen.includes(m.id));
    const next=refreshDecision(state);
    assert.equal(new Set(next.results.map(m=>m.id)).size,next.results.length);
    assert.ok(next.results.every(m=>pool.some(x=>x.id===m.id)));
    if(pool.length>=6)assert.ok(next.results.every(m=>!state.results.some(x=>x.id===m.id)));
    if(unseen.length>=3)assert.ok(next.results.every(m=>!state.seen.includes(m.id)));
    next.results.forEach(m=>encountered.add(m.id));
    state=next;
   }
   assert.equal(encountered.size,pool.length);
  }
 }
});
console.log(JSON.stringify({checks,newRecipes:added.length,total:meals.length}));
