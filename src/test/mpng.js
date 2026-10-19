const {chromium}=require('playwright');const mascot=require('./core/mascot.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:240,height:240}});
for(const m of ['happy','cheer','wow','think','love','sleep']){await p.setContent('<body style="margin:0;background:transparent">'+mascot(m,240)+'</body>');await p.screenshot({path:'mp-assets/mascot-'+m+'.png',omitBackground:true});}
await b.close()})();
