const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dir = path.join(__dirname, '..', 'data');
const raw = fs.readFileSync(path.join(dir, 'data.txt'), 'utf8');
const chapters = [];
for (const line of raw.split('\n')) {
  if (line.startsWith('## ')) {
    const [num, ...rest] = line.slice(3).split(' ');
    const [title, sub] = rest.join(' ').split('｜');
    chapters.push({ num, title, sub, items: [] });
  } else if (line.includes('||')) {
    const [en, zh, ex, exzh] = line.split('||').map(s => s.trim());
    chapters[chapters.length - 1].items.push({ en, zh, ex, exzh });
  }
}
const total = chapters.reduce((n, c) => n + c.items.length, 0);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const channels = [
  ['Emma Chamberlain', '生活 vlog', '语速快、口头禅多，练"像年轻人一样说话"'],
  ["Nathaniel Drew", '慢生活 / 学习', '语速适中、发音清晰，适合跟读'],
  ['Matt D\'Avella', '极简 / 习惯', '句子短、表达干净，适合学观点表达'],
  ['Ali Abdaal', '效率 / 学习', '英式口音，学习与工作场景词汇多'],
  ['Kara and Nate', '旅行', '旅行全场景，美式日常口语'],
  ['Jenn Im', '穿搭 / 购物', 'haul 和购物表达集中'],
  ['Rachel\'s English', '发音教学', '连读、弱读专项，配合本手册纠音'],
  ['English with Lucy', '英式口语教学', '系统讲解地道表达与雅思口语'],
];

const chapterHtml = chapters.map(c => `
<section class="chapter">
  <div class="chead"><span class="cnum">${c.num}</span><div><h2>${esc(c.title)}</h2><p>${esc(c.sub || '')}</p></div></div>
  ${c.items.map((it, i) => `
  <div class="item">
    <div class="en"><span class="idx">${c.num}.${String(i + 1).padStart(2, '0')}</span>${esc(it.en)}</div>
    <div class="zh">${esc(it.zh)}</div>
    <div class="ex">${esc(it.ex)}</div>
    <div class="exzh">${esc(it.exzh)}</div>
  </div>`).join('')}
</section>`).join('');

const days = Array.from({ length: 30 }, (_, i) => {
  const c = chapters[Math.floor(i / 3) % chapters.length];
  const part = ['1–7 句', '8–14 句', '15–20 句'][i % 3];
  return `<tr><td>Day ${i + 1}</td><td>${c.num} ${esc(c.title)} · ${part}</td><td></td><td></td></tr>`;
}).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: A4; margin: 16mm 14mm; }
* { box-sizing: border-box; }
body { font-family: 'WenQuanYi Zen Hei', sans-serif; color: #222; font-size: 10.5pt; line-height: 1.5; margin: 0; }
.cover { height: 265mm; display: flex; flex-direction: column; justify-content: center; padding: 0 10mm; background: linear-gradient(160deg,#fff4ec 0%,#ffe1cf 100%); border-radius: 6mm; page-break-after: always; }
.cover .tag { color: #e4572e; font-size: 12pt; letter-spacing: 2px; }
.cover h1 { font-size: 34pt; line-height: 1.25; margin: 6mm 0; color: #1f1f1f; }
.cover .sub { font-size: 14pt; color: #555; }
.cover .stats { margin-top: 14mm; display: flex; gap: 8mm; }
.cover .stat { background: #fff; border-radius: 4mm; padding: 4mm 6mm; }
.cover .stat b { display: block; font-size: 20pt; color: #e4572e; }
h2 { margin: 0; font-size: 17pt; }
.page { page-break-after: always; }
.intro h2 { color: #e4572e; margin-bottom: 4mm; }
.intro li { margin-bottom: 2mm; }
.toc div { display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding: 2mm 0; }
.chapter { page-break-before: always; }
.chead { display: flex; align-items: center; gap: 4mm; margin-bottom: 4mm; border-bottom: 2px solid #e4572e; padding-bottom: 3mm; }
.chead p { margin: 0; color: #888; }
.cnum { font-size: 26pt; color: #e4572e; font-weight: bold; }
.item { break-inside: avoid; padding: 2.6mm 3mm; margin-bottom: 2mm; background: #fafafa; border-left: 3px solid #ffb38a; border-radius: 1.5mm; }
.en { font-size: 12.5pt; font-weight: bold; color: #1a1a1a; }
.idx { font-size: 8pt; color: #e4572e; margin-right: 2.5mm; font-weight: normal; }
.zh { color: #e4572e; font-size: 10pt; }
.ex { font-style: italic; color: #333; margin-top: 1mm; }
.exzh { color: #777; font-size: 9.5pt; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
td, th { border: 1px solid #ddd; padding: 2mm; text-align: left; }
th { background: #fff1e8; }
.foot { color: #999; font-size: 8.5pt; margin-top: 6mm; }
</style></head><body>
<div class="cover">
  <div class="tag">YOUTUBE 地道口语 · 场景速查手册</div>
  <h1>油管博主天天在说的<br>地道口语 ${total} 句</h1>
  <div class="sub">10 大生活场景｜每句配例句和中文｜附 30 天跟练打卡表</div>
  <div class="stats">
    <div class="stat"><b>${total}</b>高频表达</div>
    <div class="stat"><b>10</b>生活场景</div>
    <div class="stat"><b>30</b>天打卡计划</div>
  </div>
</div>

<div class="page intro">
  <h2>这本手册怎么用</h2>
  <p>课本里教的是 "How are you? I'm fine, thank you."，油管博主嘴里说的却是 "It's been a minute"、"I'm down"、"Not gonna lie"。这本手册把英语 vlog 里出现频率最高的口语表达按生活场景整理出来，每一句都配了一个日常例句。</p>
  <ul>
    <li><b>每天 10 分钟</b>：按书末的 30 天打卡表，每天学 6–7 句，大声跟读 3 遍。</li>
    <li><b>造自己的句子</b>：每句学完，用它说一句和你今天有关的话，写在打卡表"我的句子"一栏。</li>
    <li><b>边看边找</b>：去看书末推荐的 YouTube 频道，听到手册里的表达就打个勾，一周就能明显感觉"听得懂了"。</li>
    <li><b>雅思口语</b>：第 08 章"表达观点"可以直接用在 Part 2 / Part 3。</li>
  </ul>
  <h2 style="margin-top:8mm">目录</h2>
  <div class="toc">${chapters.map(c => `<div><span>${c.num}　${esc(c.title)}</span><span>${c.items.length} 句</span></div>`).join('')}
  <div><span>附录 A　推荐跟练的 YouTube 频道</span><span></span></div>
  <div><span>附录 B　30 天跟练打卡表</span><span></span></div></div>
</div>

${chapterHtml}

<section class="chapter">
  <div class="chead"><span class="cnum">A</span><div><h2>推荐跟练的 YouTube 频道</h2><p>拿着手册去"找句子"，听力和口语一起涨</p></div></div>
  <table><tr><th>频道</th><th>类型</th><th>适合练什么</th></tr>
  ${channels.map(c => `<tr><td><b>${esc(c[0])}</b></td><td>${c[1]}</td><td>${c[2]}</td></tr>`).join('')}</table>
  <p class="foot">频道仅作学习推荐，本手册内容为整理编写的常用口语表达与原创例句，与上述频道无合作关系。</p>
</section>

<section class="chapter">
  <div class="chead"><span class="cnum">B</span><div><h2>30 天跟练打卡表</h2><p>每天一格，坚持 30 天</p></div></div>
  <table><tr><th style="width:16mm">天数</th><th>今日内容</th><th style="width:14mm">✓</th><th>我的句子</th></tr>${days}</table>
</section>
</body></html>`;

(async () => {
  fs.writeFileSync(path.join(dir, 'book.html'), html);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  const out = process.argv[2];
  await page.pdf({ path: out, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:8px;color:#aaa;width:100%;text-align:center;font-family:WenQuanYi Zen Hei">油管地道口语速查手册 · <span class="pageNumber"></span></div>',
    margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' } });
  // cover preview image for notes
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.screenshot({ path: out.replace(/\.pdf$/, '-封面.png'), clip: { x: 0, y: 0, width: 794, height: 1060 } });
  await browser.close();
  console.log('ok', total, 'items');
})();
