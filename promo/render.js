const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1440}});
await p.goto('file://'+__dirname+'/slides.html');await p.waitForTimeout(2500);
const names=['01封面','02消消乐','03跟读打分','04环球旅行','05三十天后的你','06封面大片'];
for(let i=1;i<=6;i++){await (await p.$('#s'+i)).screenshot({path:'xhs-'+names[i-1]+'.png'})}
await b.close()})();
