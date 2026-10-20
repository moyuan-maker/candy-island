// 批量出 30 天图文笔记图：node render.js  输出 out/dayNN-1/2/3.png
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const OUT = process.env.OUT || path.join(__dirname, 'out');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1440 } });
  const days = process.argv[2] ? [+process.argv[2]] : Array.from({ length: 30 }, (_, i) => i + 1);
  for (const d of days) {
    await p.goto('http://127.0.0.1:8765/promo/notes/card.html?day=' + d); await p.waitForTimeout(d === days[0] ? 2500 : 600);
    for (const k of [1, 2, 3]) await (await p.$('#s' + k)).screenshot({ path: path.join(OUT, `day${String(d).padStart(2, '0')}-${k}.png`) });
  }
  await b.close();
})();
