import fs from 'node:fs';
import assert from 'node:assert/strict';
import { load, loadIsolated } from './test-support.mjs';
const meals=JSON.parse(fs.readFileSync('lib/meals.json','utf8'));
const {filterMeals,matchIngredient}=load('lib/engine.ts');
const KEY='middagen_analytics_consent_v1', ID='G-RB2YJ9DF6M';
let checks=0;
function test(name,fn){fn();checks++;console.log(`PASS ${name}`);}

// A minimal browser: storage, cookies and <head>, with a fresh analytics module per page load.
function page({hostname='middagen.no',protocol='https:',stored=null,storageBlocked=false,cookies=[]}={}){
  const storage=new Map(stored?[[KEY,stored]]:[]);
  const jar=new Map(cookies.map(name=>[name,'1']));
  const scripts=[];
  const guard=()=>{if(storageBlocked)throw new Error('storage blocked');};
  const window={
    location:{hostname,protocol,pathname:'/',href:`${protocol}//${hostname}/`},
    localStorage:{getItem:k=>{guard();return storage.get(k)??null;},setItem:(k,v)=>{guard();storage.set(k,String(v));}},
    document:{
      title:'Forside',
      head:{appendChild:el=>scripts.push(el)},
      createElement:tag=>({tag}),
      get cookie(){return [...jar].map(([k,v])=>`${k}=${v}`).join('; ');},
      set cookie(value){const [pair,...attrs]=value.split(';');const name=pair.split('=')[0].trim();if(attrs.some(a=>a.trim()==='Max-Age=0'))jar.delete(name);else jar.set(name,pair.split('=')[1]);},
    },
  };
  const analytics=loadIsolated('lib/analytics.ts',{window});
  // JSON round-trip: values come from another realm, and gtag receives plain data only.
  const commands=()=>Array.from(window.dataLayer??[],args=>JSON.parse(JSON.stringify(Array.from(args))));
  // A client-side App Router navigation: same page load, new path and title.
  const navigate=(pathname,title)=>{window.location.pathname=pathname;window.location.href=`${protocol}//${hostname}${pathname}`;window.document.title=title;};
  return {window,analytics,storage,scripts,jar,commands,navigate,events:()=>commands().filter(c=>c[0]==='event')};
}
const browse=p=>{p.analytics.trackEvent('instant_suggestions_click');p.analytics.trackEvent('suggestions_shown',{source:'instant',result_count:3});p.analytics.trackMealSelected('tomatsuppe','instant');p.analytics.trackRecipeOpen('tomatsuppe');p.analytics.trackEvent('portion_change',{meal_slug:'tomatsuppe',portions:5});};

test('1. no GA script, dataLayer or event without a choice',()=>{
  const p=page();
  assert.equal(p.analytics.initAnalytics(),null);browse(p);
  assert.equal(p.scripts.length,0);assert.equal(p.window.dataLayer,undefined);assert.equal(p.window.gtag,undefined);
});
test('2. accept loads gtag.js once with denied defaults before an analytics-only grant',()=>{
  const p=page();p.analytics.setAnalyticsConsent('accepted');
  assert.equal(p.storage.get(KEY),'accepted');
  assert.equal(p.scripts.length,1);assert.equal(p.scripts[0].src,`https://www.googletagmanager.com/gtag/js?id=${ID}`);assert.equal(p.scripts[0].async,true);
  const c=p.commands();
  assert.deepEqual(c[0],['consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}]);
  assert.deepEqual(c[1],['consent','update',{analytics_storage:'granted'}]);
  assert.equal(c[2][0],'js');
  assert.deepEqual(c[3],['config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false}]);
  assert.ok(!JSON.stringify(c).includes('"ad_storage":"granted"')&&!JSON.stringify(c).includes('"ad_user_data":"granted"')&&!JSON.stringify(c).includes('"ad_personalization":"granted"'));
});
test('3. reject stores the choice and never loads GA',()=>{
  const p=page();p.analytics.setAnalyticsConsent('rejected');browse(p);
  assert.equal(p.storage.get(KEY),'rejected');assert.equal(p.scripts.length,0);assert.equal(p.window.dataLayer,undefined);
});
test('4. an earlier accepted choice is respected on the next visit',()=>{
  const p=page({stored:'accepted'});assert.equal(p.analytics.initAnalytics(),'accepted');
  assert.equal(p.scripts.length,1);browse(p);assert.equal(p.events().length,5);
});
test('5. an earlier rejected choice is respected on the next visit',()=>{
  const p=page({stored:'rejected'});assert.equal(p.analytics.initAnalytics(),'rejected');browse(p);
  assert.equal(p.scripts.length,0);assert.equal(p.window.dataLayer,undefined);
});
test('   unknown stored values count as no choice',()=>{
  const p=page({stored:'yes'});assert.equal(p.analytics.initAnalytics(),null);assert.equal(p.scripts.length,0);
});
test('6. consent can be withdrawn and given again; GA cookies are removed on withdrawal',()=>{
  const p=page({cookies:['_ga','_ga_RB2YJ9DF6M','annet']});
  p.analytics.setAnalyticsConsent('accepted');browse(p);assert.equal(p.events().length,5);
  p.analytics.setAnalyticsConsent('rejected');
  assert.equal(p.storage.get(KEY),'rejected');
  assert.deepEqual(p.commands().at(-1),['consent','update',{analytics_storage:'denied'}]);
  assert.equal(p.window[`ga-disable-${ID}`],true);
  assert.deepEqual([...p.jar.keys()],['annet']);
  browse(p);assert.equal(p.events().length,5,'no events after withdrawal');
  p.analytics.setAnalyticsConsent('accepted');
  assert.equal(p.window[`ga-disable-${ID}`],false);assert.equal(p.scripts.length,1);
  p.analytics.trackEvent('decide_for_me');assert.equal(p.events().length,6);
});
test('7. events are a no-op without consent, also when storage is blocked',()=>{
  const p=page({storageBlocked:true});browse(p);assert.equal(p.window.dataLayer,undefined);
  p.analytics.setAnalyticsConsent('accepted');p.analytics.trackEvent('decide_for_me');
  assert.equal(p.events().length,1,'blocked storage keeps the choice for this page load');
});
test('8. events are sent with typed parameters after consent',()=>{
  const p=page({stored:'accepted'});browse(p);
  p.analytics.trackRecipeOpen('laks-med-poteter');
  p.analytics.trackEvent('guided_picker_complete',p.analytics.guidedPickerParams({time:'30',type:'vegetar',price:'billig'},2));
  assert.deepEqual(p.events(),[
    ['event','instant_suggestions_click',{}],
    ['event','suggestions_shown',{source:'instant',result_count:3}],
    ['event','meal_selected',{meal_slug:'tomatsuppe',source:'instant'}],
    ['event','recipe_open',{meal_slug:'tomatsuppe',source:'instant'}],
    ['event','portion_change',{meal_slug:'tomatsuppe',portions:5}],
    ['event','recipe_open',{meal_slug:'laks-med-poteter'}],
    ['event','guided_picker_complete',{time_bucket:'30',category:'vegetar',price_tier:'billig',result_count:2}],
  ]);
  assert.deepEqual({...p.analytics.guidedPickerParams({time:'<x>',type:'x',price:'x'},0)},{time_bucket:'other',category:'other',price_tier:'other',result_count:0});
});
test('9. raw ingredient text is never sent, only a vocabulary term or nothing',()=>{
  const p=page({stored:'accepted'});
  const all={time:'all',type:'all',price:'all'};
  const typed=['  Jeg har KYLING ','kyling','Laksefilet','vegetarisk','sjokoladekake til Ola Nordmann','ola@example.com','<script>alert(1)</script>'];
  for(const raw of typed){
    const match=matchIngredient(raw,meals);
    const found=match.intent?filterMeals(meals,{...all,type:match.intent}):match.ingredient?filterMeals(meals,all,match.ingredient):[];
    p.analytics.trackIngredientSearch(match,found.length);
  }
  const sent=p.events();
  assert.deepEqual(sent.map(e=>e[2].ingredient_family??null),['kylling','kylling','laks','vegetar',null,null,null]);
  const vocabulary=new Set(meals.flatMap(m=>[...m.mainIngredients,...m.secondaryIngredients]));
  for(const [,,params] of sent)if(params.ingredient_family&&params.ingredient_family!=='vegetar')assert.ok(vocabulary.has(params.ingredient_family));
  const payload=JSON.stringify(p.commands()).toLowerCase();
  for(const word of ['jeg har','kyling','laksefilet','sjokolade','ola','example.com','script'])assert.ok(!payload.includes(word),word);
  // The picker passes only the match object and counts to analytics, never the query state.
  const picker=fs.readFileSync('components/dinner-picker.tsx','utf8');
  const calls=picker.match(/(trackEvent|trackMealSelected|trackIngredientSearch|shown)\([^;]*?\)/g)??[];
  assert.ok(calls.length>=8);
  for(const call of calls)assert.ok(!/\b(query|searched|value|target|filters\.|state)\b/.test(call.replace('guidedPickerParams(filters','')),call);
});
test('10. localhost and 127.0.0.1 never send analytics',()=>{
  for(const [hostname,protocol] of [['localhost','http:'],['127.0.0.1','http:'],['localhost','https:'],['[::1]','http:']]){
    const p=page({hostname,protocol});p.analytics.setAnalyticsConsent('accepted');browse(p);
    assert.equal(p.scripts.length,0,hostname);assert.equal(p.window.dataLayer,undefined,hostname);assert.equal(p.storage.get(KEY),'accepted');
  }
});
test('11. vercel.app, previews, chatgpt.site and www never send analytics',()=>{
  for(const hostname of ['middagen-gamma.vercel.app','middagen-git-main-andreas-projects-ae6ec966.vercel.app','middagen-hverdag.andreas-swane.chatgpt.site','www.middagen.no','middagen.no.evil.example','staging.middagen.no']){
    const p=page({hostname,stored:'accepted'});p.analytics.initAnalytics();browse(p);
    assert.equal(p.scripts.length,0,hostname);assert.equal(p.window.dataLayer,undefined,hostname);
  }
});
test('12. https://middagen.no can send analytics; plain http cannot',()=>{
  assert.equal(page().analytics.isAnalyticsHost('middagen.no','https:'),true);
  assert.equal(page().analytics.isAnalyticsHost('middagen.no','http:'),false);
  const p=page({stored:'accepted'});browse(p);assert.equal(p.events().length,5);
});
test('13. page_view is not duplicated: config counts the load, one page_view per navigation',()=>{
  const p=page({stored:'accepted'});
  for(let i=0;i<3;i++){p.analytics.initAnalytics();p.analytics.trackPageView();}
  p.analytics.setAnalyticsConsent('accepted');p.analytics.setAnalyticsConsent('rejected');p.analytics.setAnalyticsConsent('accepted');browse(p);
  const c=p.commands();
  assert.equal(c.filter(x=>x[0]==='config').length,1);assert.equal(c.filter(x=>x[0]==='js').length,1);assert.equal(p.scripts.length,1);
  assert.equal(c.filter(x=>x[0]==='consent'&&x[1]==='default').length,1);
  assert.ok(!c.some(x=>x[1]==='page_view'),'the first page is counted by config only');
  // / -> recipe (event runs before the route effect) -> back to / -> /om/
  p.navigate('/middag/tomatsuppe/','Tomatsuppe');p.analytics.trackRecipeOpen('tomatsuppe');p.analytics.trackPageView();p.analytics.trackPageView();
  p.navigate('/','Forside');p.analytics.trackPageView();p.analytics.trackPageView();
  p.navigate('/om/','Om');p.analytics.trackPageView();
  const views=p.events().filter(e=>e[1]==='page_view').map(e=>e[2]);
  assert.deepEqual(views,[
    {page_location:'https://middagen.no/middag/tomatsuppe/'},
    {page_location:'https://middagen.no/'},
    {page_location:'https://middagen.no/om/'},
  ]);
  const names=p.events().map(e=>e[1]);
  assert.ok(names.indexOf('page_view')<names.lastIndexOf('recipe_open'),'the new page is counted before its first event');
});
test('   page_view is a no-op without consent and outside production',()=>{
  for(const p of [page(),page({stored:'rejected'}),page({hostname:'middagen-gamma.vercel.app',stored:'accepted'})]){
    p.navigate('/om/','Om');p.analytics.trackPageView();assert.equal(p.window.dataLayer,undefined);
  }
});
console.log(JSON.stringify({checks}));
