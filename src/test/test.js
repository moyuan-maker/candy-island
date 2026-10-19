const {chromium}=require('playwright');
process.on('unhandledRejection',async e=>{console.log(e.message.split('\n')[0]);try{await global.P.screenshot({path:'t-fail.png'});console.log(await global.P.evaluate(()=>JSON.stringify({i:L.i,t:L.steps[L.i].type,foot:$('#foot').innerHTML.slice(0,300)})))}catch(x){console.log(x.message)}process.exit(1)});
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:400,height:820},deviceScaleFactor:2});global.P=p;
async function sayIt(){await p.click('#mic');await p.waitForSelector('#nx, #go, #sr1',{timeout:20000});if(await p.$('#sr1'))await p.click('#sr1');await p.waitForTimeout(300);}
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(800);
await p.screenshot({path:'t-intro.png'});
await p.fill('#nm0','Lily');await p.click('#go0');await p.waitForTimeout(500);
await p.screenshot({path:'t-map.png'});
await p.evaluate(()=>{window.speak=async()=>{};listen=async t=>({mode:'sr',text:t.split(' ').length>2?t.split(' ').slice(0,-1).join(' '):t})});await p.click('#cookie');await p.waitForTimeout(300);
await p.click('.node[data-id="1"]');await p.waitForTimeout(600);
await p.screenshot({path:'t-learn.png'});
// go through steps
for(let k=0;k<20;k++){
  const type=await p.evaluate(()=>L&&L.steps[L.i]&&L.steps[L.i].type);
  if(!type)break;
  if(type==='learn'){if(k==0)console.log('SR',await p.evaluate(()=>!!SR));await sayIt();if(k==0)await p.screenshot({path:'t-learn2.png'});await p.click('#nx');}
  else if(type==='choose'){if(!global.c1){global.c1=1;await p.screenshot({path:'t-choose.png'});}await p.click('.opt');await p.waitForTimeout(200);await p.click('#go',{timeout:4000});}
  else if(type==='build'){const ans=await p.evaluate(()=>L.steps[L.i].answer);const tiles=await p.evaluate(()=>L.steps[L.i].tiles.map(t=>t.w));
     if(!global.b1){global.b1=1;await p.screenshot({path:'t-build.png'});}
     const used=new Set();for(const w of ans){const k=tiles.findIndex((t,i)=>t===w&&!used.has(i));used.add(k);await p.click(`#pool .tile[data-k="${k}"]`);}
     await p.waitForTimeout(900);if(!global.b2){global.b2=1;await p.screenshot({path:'t-build2.png'});}await p.click('#go',{timeout:4000});}
  else if(type==='fill'){if(!global.f1){global.f1=1;await p.screenshot({path:'t-fill.png'});}await p.click('.pool .tile');await p.waitForTimeout(200);await p.click('#go',{timeout:4000});}
  else if(type==='act'){await p.screenshot({path:'t-act.png'});await sayIt();await p.click('#go',{timeout:4000});}
  else if(type==='match'){await p.screenshot({path:'t-match.png'});const tiles=await p.evaluate(()=>L.steps[L.i].tiles);
     const by={};tiles.forEach((t,i)=>{(by[t.k]=by[t.k]||[]).push(i)});
     let first=true;for(const k in by){if(first){await p.click(`.gem[data-k="${by[k][0]}"]`);await p.waitForTimeout(150);await p.screenshot({path:'t-match2.png'});first=false;}else await p.click(`.gem[data-k="${by[k][0]}"]`);await p.click(`.gem[data-k="${by[k][1]}"]`);await p.waitForTimeout(150);}
     await p.waitForTimeout(800);await p.click('#go',{timeout:4000});}
  await p.waitForTimeout(250);
}
await p.waitForTimeout(1500);await p.screenshot({path:'t-result.png',fullPage:false});
await p.evaluate(()=>{$('#result').hidden=true;document.body.style.overflow='';});
await p.click('.tabs button[data-v="vFuture"]');await p.waitForTimeout(600);await p.screenshot({path:'t-future.png',fullPage:true});
await p.click('.tabs button[data-v="vMe"]');await p.waitForTimeout(300);await p.screenshot({path:'t-me.png',fullPage:true});
await p.evaluate(()=>{for(let i=1;i<=30;i++)S.lv[i]={stars:3};S.stickers=[0,1,2,3,4];save();openGrad()});await p.waitForTimeout(500);await p.screenshot({path:'t-grad.png'});
for(let i=0;i<6;i++){await sayIt();await p.click('#nx');await p.waitForTimeout(200);}
await p.waitForTimeout(1200);await p.screenshot({path:'t-cover.png',fullPage:true});
console.log('errors',errs);await b.close()})();
