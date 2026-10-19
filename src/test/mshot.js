const {chromium}=require('playwright');const mascot=require('./core/mascot.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:200}});
await p.setContent('<body style="margin:0;background:#bfeaff;display:flex">'+['happy','cheer','wow','think','love','sleep'].map(m=>mascot(m,150)).join('')+'</body>');
await p.screenshot({path:'mascots.png'});await b.close()})();
