const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>{S.intro=true;S.name='Lily';for(let i=1;i<=7;i++)S.lv[i]={stars:i%3?3:2};S.stickers=[0];S.streak=7;S.last=Engine.today();S.xp=486;S.todayXp=22;S.todayDate=Engine.today();S.badges=['first','streak3','streak7','combo8'];S.tips=[8];save();
 window.speak=async()=>{};listen=async t=>({mode:'sr',text:t});rain=()=>{};burst=()=>{};praise=()=>{};$('#intro').hidden=true;document.body.style.overflow='';renderMap.scrolled=1;renderMap();});
await p.waitForTimeout(400);await p.evaluate(()=>{const n=document.querySelector('.node.cur');scrollTo(0,n.getBoundingClientRect().top+scrollY-430)});await p.waitForTimeout(300);
await p.screenshot({path:'promo/app-map.png'});
await p.evaluate(()=>startLesson(20));await p.waitForTimeout(400);
await p.click('#mic');await p.waitForTimeout(500);await p.screenshot({path:'promo/app-score.png'});
await p.evaluate(()=>{L.i=L.steps.findIndex(s=>s.type==='match');renderStep()});await p.waitForTimeout(300);
const t=await p.evaluate(()=>L.steps[L.i].tiles);const by={};t.forEach((x,i)=>(by[x.k]=by[x.k]||[]).push(i));
await p.click(`.gem[data-k="${by[0][0]}"]`);await p.click(`.gem[data-k="${by[0][1]}"]`);await p.waitForTimeout(600);
await p.click(`.gem[data-k="${by[1][0]}"]`);await p.waitForTimeout(200);
await p.evaluate(()=>{const c=document.querySelector('.combo')||null;});
await p.screenshot({path:'promo/app-match.png'});
await p.evaluate(()=>{L.i=L.steps.findIndex(s=>s.type==='build');renderStep()});await p.waitForTimeout(300);
const ans=await p.evaluate(()=>L.steps[L.i].answer);const tl=await p.evaluate(()=>L.steps[L.i].tiles.map(t=>t.w));const used=new Set();
for(const w of ans.slice(0,3)){const k=tl.findIndex((x,i)=>x===w&&!used.has(i));used.add(k);await p.click(`#pool .tile[data-k="${k}"]`);}
await p.waitForTimeout(300);await p.screenshot({path:'promo/app-build.png'});
await p.evaluate(()=>{L.i=L.steps.findIndex(s=>s.type==='act');renderStep()});await p.waitForTimeout(400);await p.screenshot({path:'promo/app-act.png'});
await p.evaluate(()=>{quitLesson();document.querySelector('.tabs button[data-v="vFuture"]').click()});await p.waitForTimeout(400);await p.screenshot({path:'promo/app-future.png'});
await p.evaluate(()=>{for(let i=1;i<=30;i++)S.lv[i]={stars:3};S.speaks=236;S.stickers=[0,1,2,3,4];openGrad()});await p.waitForTimeout(300);
for(let i=0;i<6;i++){await p.click('#mic');await p.waitForSelector('#nx');await p.click('#nx');await p.waitForTimeout(100);}
await p.waitForTimeout(800);const cv=await p.$('#cv');await cv.screenshot({path:'promo/app-cover.png'});
await b.close()})();
