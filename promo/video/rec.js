// 批量录制小红书竖屏视频：node rec.js [id前缀...]  输出 out/<id>.mp4
// 需要先在仓库根目录起服务：python3 -m http.server 8765
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const SPECS = require('./specs.js');
const OUT = process.env.OUT || path.join(__dirname, 'out');
const BASE = 'http://127.0.0.1:8765';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function setupApp(f, level) {
  await f.evaluate(lv => {
    S.intro = true; S.name = 'Lily'; S.pro = true; S.streak = lv; S.last = Engine.today(); S.xp = 40 * lv; S.todayXp = 10; S.todayDate = Engine.today();
    for (let i = 1; i < lv; i++) S.lv[i] = { stars: 3 };
    save(); $('#intro').hidden = true; document.body.style.overflow = '';
    // 假 TTS：逐词高亮（卡拉 OK 效果）；假识别：读得很好
    window.speak = (text, opt, host) => new Promise(res => {
      const sp = host ? [...host.querySelectorAll('.w')] : []; let k = 0;
      if (!sp.length) return setTimeout(res, 900);
      const t = setInterval(() => { sp.forEach(s => s.classList.remove('say')); if (k < sp.length) sp[k++].classList.add('say'); else { clearInterval(t); res(); } }, 330);
    });
    listen = t => new Promise(r => setTimeout(() => r({ mode: 'sr', text: t }), 1300));
    renderMap.scrolled = 1; renderMap();
  }, level);
}
const stepIdx = (f, type, nth = 0) => f.evaluate(([t, n]) => { let c = 0; for (let i = 0; i < L.steps.length; i++) if (L.steps[i].type === t && c++ === n) return i; return -1; }, [type, nth]);
async function goStep(f, level, type, nth) {
  await f.evaluate(lv => { $('#result').hidden = true; $('#intro').hidden = true; if (!L || L.id !== lv || $('#lesson').hidden) startLesson(lv); }, level);
  const i = await stepIdx(f, type, nth); if (i < 0) return false;
  await f.evaluate(i => { L.i = i; renderStep(); }, i); return true;
}
async function finishFast(f, level) {
  await f.evaluate(lv => {
    $('#intro').hidden = true;
    if (!L || L.id !== lv || $('#lesson').hidden) startLesson(lv);
    L.speak = [96, 92, 98, 95]; L.games = 4; L.right = 4; L.maxCombo = 9; L.xp = 24; finish();
  }, level);
}
const ACTS = {
  async result(p, f, v) { await finishFast(f, v.level); await wait(300); },
  async finish(p, f, v) { await finishFast(f, v.level); await f.evaluate(() => scrollTo(0, 0)); },
  async learn(p, f, v, s, n = 0) {
    await goStep(f, v.level, 'learn', n); await wait(2600);
    await f.click('#mic'); await wait(1700);
    if (s.after) await cap(p, s.after, s.mood); await wait(1600);
  },
  async learn2(p, f, v, s) { return ACTS.learn(p, f, v, s, 2); },
  async match(p, f, v) {
    if (!(await goStep(f, v.level, 'match', 0))) return; await wait(900);
    const tiles = await f.evaluate(() => L.steps[L.i].tiles); const by = {};
    tiles.forEach((t, i) => (by[t.k] = by[t.k] || []).push(i));
    for (const k of Object.keys(by).slice(0, 5)) { await f.click(`.gem[data-k="${by[k][0]}"]`); await wait(300); await f.click(`.gem[data-k="${by[k][1]}"]`); await wait(550); }
    await wait(700);
  },
  async build(p, f, v) {
    if (!(await goStep(f, v.level, 'build', 0))) return; await wait(900);
    const ans = await f.evaluate(() => L.steps[L.i].answer), tl = await f.evaluate(() => L.steps[L.i].tiles.map(t => t.w)), used = new Set();
    for (const w of ans) { const k = tl.findIndex((x, i) => x === w && !used.has(i)); used.add(k); await f.click(`#pool .tile[data-k="${k}"]`); await wait(380); }
    await wait(1500);
  },
  async choose(p, f, v) {
    if (!(await goStep(f, v.level, 'choose', 0))) return; await wait(1500);
    const ok = await f.evaluate(() => { const st = L.steps[L.i]; return st.options.indexOf(st.answer); });
    await f.click(`.opt[data-i="${ok}"]`); await wait(1800);
  },
  async map(p, f) {
    await f.evaluate(() => { $('#result').hidden = true; $('#lesson').hidden = true; $('#intro').hidden = true; document.body.style.overflow = ''; renderMap(); scrollTo(0, 0); });
    await wait(500);
    const H = await f.evaluate(() => document.body.scrollHeight - innerHeight);
    for (let y = 0; y <= H; y += 45) { await f.evaluate(y => scrollTo(0, y), y); await wait(33); }
    await wait(500);
  },
  async future(p, f) {
    await f.evaluate(() => { $('#result').hidden = true; $('#lesson').hidden = true; document.body.style.overflow = ''; scrollTo(0, 0); document.querySelector('.tabs button[data-v="vFuture"]').click(); });
    await wait(900);
    const H = await f.evaluate(() => document.body.scrollHeight - innerHeight);
    for (let y = 0; y <= H; y += 40) { await f.evaluate(y => scrollTo(0, y), y); await wait(33); }
    await wait(600);
  },
  async grad(p, f) {
    await f.evaluate(() => { $('#result').hidden = true; $('#lesson').hidden = true; for (let i = 1; i <= 30; i++) S.lv[i] = { stars: 3 }; S.stickers = [0, 1, 2, 3, 4]; save(); openGrad(); });
    for (let i = 0; i < 6; i++) { await wait(i < 2 ? 1800 : 300); await f.click('#mic'); await f.waitForSelector('#nx'); await wait(i < 2 ? 900 : 200); await f.click('#nx'); }
    await wait(1500);
  },
  async cover(p, f, v) {
    await f.evaluate(() => { $('#result').hidden = true; $('#lesson').hidden = true; for (let i = 1; i <= 30; i++) S.lv[i] = { stars: 3 }; S.stickers = [0, 1, 2, 3, 4]; save(); });
    const has = await f.evaluate(() => !!document.querySelector('#cv') && !$('#intro').hidden);
    if (!has) {
      await f.evaluate(() => { openGrad(); });
      for (let i = 0; i < 6; i++) { await f.click('#mic'); await f.waitForSelector('#nx'); await f.click('#nx'); }
    }
    await wait(400); await f.evaluate(() => scrollTo(0, 0));
  },
  async cta(p) { await p.evaluate(() => set({ end: true })); await wait(3200); },
};
const cap = (p, text, mood) => p.evaluate(([t, m]) => set({ cap: t, mood: m }), [text, mood || 'cheer']);

async function record(b, v) {
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '/promo/video/stage.html');
  await p.evaluate(() => { document.getElementById('app').src = '/src/index.html'; });
  await wait(1500);
  const f = p.frames().find(x => x.url().includes('/src/index.html'));
  await setupApp(f, v.level);
  await p.evaluate(([t, h]) => set({ tag: t, hook: h }), [v.tag, v.hook]);
  // 第一个镜头先在镜头外摆好（第一帧就是成品画面）
  const s0 = v.shots[0]; await ACTS[s0.act](p, f, v, s0); await cap(p, s0.cap, s0.mood);
  await f.evaluate(() => { if (window.rain) rain(); }); await wait(800);
  // 开录：CDP 截屏流，图像质量比 recordVideo 高
  const dir = fs.mkdtempSync('/tmp/vfr-'); const frames = [];
  const cdp = await ctx.newCDPSession(p);
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const fn = path.join(dir, `f${String(frames.length).padStart(5, '0')}.jpg`);
    fs.writeFileSync(fn, Buffer.from(data, 'base64')); frames.push({ fn, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await wait(s0.hold || 2000);
  for (const s of v.shots.slice(1)) {
    if (s.cap) await cap(p, s.cap, s.mood);
    await ACTS[s.act](p, f, v, s);
    if (s.hold) await wait(s.hold);
  }
  await wait(300); const tEnd = Date.now() / 1000;
  await cdp.send('Page.stopScreencast'); await ctx.close();
  // 拼成 30fps mp4
  let list = '';
  frames.forEach((fr, i) => { const d = (i + 1 < frames.length ? frames[i + 1].t : fr.t + 0.5) - fr.t; list += `file '${fr.fn}'\nduration ${Math.max(0.001, d).toFixed(4)}\n`; });
  list += `file '${frames[frames.length - 1].fn}'\n`;
  fs.writeFileSync(path.join(dir, 'list.txt'), list);
  const out = path.join(OUT, v.id + '.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
    '-vf', 'fps=30,scale=1080:1920,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-movflags', '+faststart', out]);
  // 封面图（第一帧）
  fs.copyFileSync(frames[0].fn, path.join(OUT, v.id + '-封面.jpg'));
  fs.rmSync(dir, { recursive: true });
  const dur = frames[frames.length - 1].t - frames[0].t;
  console.log(v.id, frames.length + ' frames', dur.toFixed(1) + 's', errs.length ? 'ERR ' + errs.join(' | ') : '');
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const want = process.argv.slice(2);
  const list = want.length ? SPECS.filter(v => want.some(w => v.id.startsWith(w))) : SPECS;
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const v of list) { try { await record(b, v); } catch (e) { console.log(v.id, 'FAIL', e.message.split('\n')[0]); } }
  await b.close();
})();
