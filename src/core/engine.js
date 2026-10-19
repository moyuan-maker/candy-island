/* 口语糖果岛 游戏逻辑（网页版与小程序共用，不依赖 DOM / wx）*/
(function (root) {
  var C = (typeof module !== 'undefined' && typeof require !== 'undefined') ? require('./content.js') : root.CONTENT;

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function words(s) { return (s.match(/[A-Za-z0-9][A-Za-z0-9'’\-]*/g) || []); }
  function norm(w) { return w.toLowerCase().replace(/[^a-z0-9]/g, ''); }
  var NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  var STOP = ['that\'s', 'the', 'you', 'i\'m', 'it\'s', 'this', 'and', 'for', 'with', 'are', 'was', 'can', 'let\'s', 'what', 'have', 'been', 'your', 'just', 'get', 'got'];
  // 打分用的分词：连字符拆开、a.m. 合并、数字转英文
  function spoken(s) {
    s = (s || '').replace(/\b([ap])\.m\./gi, '$1m').replace(/-/g, ' ');
    return words(s).map(norm).filter(Boolean).map(function (w) { return /^\d+$/.test(w) && +w <= 20 ? NUM[+w] : w; });
  }
  function pick(a, n) { return shuffle(a).slice(0, n); }

  function level(id) { return C.LEVELS[id - 1]; }
  function stage(id) { return C.STAGES[level(id).stage]; }
  // 前几段读短语，后两段读完整原句
  function readText(lv, it) { return C.STAGES[lv.stage].read === 'example' ? it.ex : it.say; }

  function sameStageItems(lv) {
    var out = [];
    C.LEVELS.forEach(function (l) { if (l.stage === lv.stage && l.id !== lv.id) out = out.concat(l.items); });
    return out;
  }

  function buildTarget(lv, it) {
    var st = lv.stage;
    var pw = words(it.say), ew = words(it.ex);
    if (st <= 1) return pw.length >= 2 ? it.say : (ew.length <= 7 ? it.ex : null);
    var lim = st === 2 ? 7 : 9;
    if (ew.length <= lim) return it.ex;
    return pw.length >= 2 ? it.say : null;
  }

  function fillQuestion(lv, it, pool) {
    var pw = words(it.say).map(norm);
    var ew = words(it.ex);
    var cand = ew.filter(function (w) { return pw.indexOf(norm(w)) >= 0 && norm(w).length >= 3 && STOP.indexOf(w.toLowerCase().replace(/’/g, "'")) < 0; });
    if (!cand.length) return null;
    cand.sort(function (a, b) { return b.length - a.length; });
    var ans = cand[0];
    var others = [];
    pool.forEach(function (o) { words(o.say).forEach(function (w) { if (norm(w).length >= 3 && STOP.indexOf(w.toLowerCase()) < 0 && norm(w) !== norm(ans) && others.indexOf(w.toLowerCase()) < 0) others.push(w.toLowerCase()); }); });
    var opts = shuffle([ans].concat(pick(others, 2)));
    var idx = it.ex.indexOf(ans);
    return { type: 'fill', item: it, before: it.ex.slice(0, idx), after: it.ex.slice(idx + ans.length), answer: ans, options: opts };
  }

  // 一关的步骤：先逐句学习跟读，再进入混合小游戏
  function buildSteps(id) {
    var lv = level(id), items = lv.items, st = lv.stage;
    var pool = sameStageItems(lv);
    var steps = items.map(function (it) { return { type: 'learn', item: it, text: readText(lv, it) }; });
    var games = [];
    pick(items, Math.min(3, items.length)).forEach(function (it) {
      var wrong = pick(pool.concat(items.filter(function (x) { return x !== it; })), 8)
        .map(function (x) { return x.short; }).filter(function (z) { return z !== it.short; });
      var uniq = []; wrong.forEach(function (z) { if (uniq.indexOf(z) < 0) uniq.push(z); });
      games.push({ type: 'choose', item: it, text: st >= 3 ? it.ex : it.say, answer: it.short, options: shuffle([it.short].concat(uniq.slice(0, 2))) });
    });
    var nb = 0;
    shuffle(items).forEach(function (it) {
      if (nb >= 2) return;
      var t = buildTarget(lv, it); if (!t) return;
      var ws = words(t); if (ws.length < 2) return;
      nb++;
      games.push({ type: 'build', item: it, text: t, answer: ws, tiles: shuffle(ws.map(function (w, i) { return { w: w, i: i }; })) });
    });
    var nf = st === 0 ? 1 : 2, cf = 0;
    shuffle(items).forEach(function (it) {
      if (cf >= nf) return;
      var q = fillQuestion(lv, it, pool); if (q) { games.push(q); cf++; }
    });
    var actIt = pick(items, 1)[0];
    games.push({ type: 'act', item: actIt, text: readText(lv, actIt), mood: pick(C.MOODS, 1)[0] });
    // 压轴：糖果消消乐，英文和中文配对消除
    var pairs = pick(items, Math.min(6, items.length));
    var tiles = [];
    pairs.forEach(function (it, k) { tiles.push({ k: k, lang: 'en', t: it.say }); tiles.push({ k: k, lang: 'zh', t: it.short }); });
    return steps.concat(shuffle(games)).concat([{ type: 'match', items: pairs, tiles: shuffle(tiles), seconds: 60 }]);
  }

  // 跟读打分：按单词做最长公共子序列对齐
  function score(target, heard) {
    var a = spoken(target), b = spoken(heard);
    var n = a.length, m = b.length, dp = [];
    for (var i = 0; i <= n; i++) { dp.push([]); for (var j = 0; j <= m; j++) dp[i].push(0); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    var marks = [], x = 0, y = 0;
    while (x < n) {
      if (y < m && a[x] === b[y]) { marks.push(true); x++; y++; }
      else if (y < m && dp[x][y + 1] >= dp[x + 1][y]) y++;
      else { marks.push(false); x++; }
    }
    var hit = marks.filter(Boolean).length;
    var s = n ? Math.round(hit / n * 100) : 0;
    if (s > 0 && s < 40) s = 40; // 敢开口就有底分
    return { score: s, marks: marks };
  }
  function verdict(s) {
    if (s >= 85) return { tier: 3, title: '完美！', say: ['发音超地道！', '简直是母语者！', '这句你拿捏了！'] };
    if (s >= 60) return { tier: 2, title: '很棒！', say: ['再顺一点就完美啦', '已经很像博主了！', '节奏对了！'] };
    return { tier: 1, title: '差一点点', say: ['慢一点再试一次？', '先听一遍慢速版吧', '敢开口就是进步！'] };
  }
  function starsFor(speakAvg, gameAcc) {
    var b = speakAvg * 0.6 + gameAcc * 100 * 0.4;
    return b >= 80 ? 3 : b >= 55 ? 2 : 1;
  }

  var BADGES = [
    { id: 'first', e: '🐣', t: '破壳而出', d: '完成第 1 关' },
    { id: 'streak3', e: '🔥', t: '三天小火苗', d: '连续打卡 3 天' },
    { id: 'streak7', e: '🌋', t: '一周不断火', d: '连续打卡 7 天' },
    { id: 'perfect10', e: '💯', t: '满分十连', d: '累计 10 次跟读满分' },
    { id: 'combo8', e: '⚡', t: '连击达人', d: '游戏连对 8 次' },
    { id: 'look20', e: '🔍', t: '好奇宝宝', d: '点查 20 个单词' },
    { id: 'star3x5', e: '🌟', t: '三星收藏家', d: '5 关拿到三星' },
    { id: 'actor', e: '🎭', t: '戏精本精', d: '完成 5 次演技挑战' },
    { id: 'half', e: '🚀', t: '半程冲刺', d: '通关第 15 关' },
    { id: 'grad', e: '🎓', t: '糖果岛毕业生', d: '通关全部 30 关' }
  ];
  // 每段旅程的最后一关（宝箱关）盖一枚护照印章
  var STICKERS = [
    { e: '🥐', t: '巴黎印章' }, { e: '🛍️', t: '纽约印章' }, { e: '🗼', t: '东京印章' }, { e: '🫖', t: '伦敦印章' }, { e: '🎬', t: '主角印章' }
  ];

  function today(d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dayDiff(a, b) { var pa = a.split('-'), pb = b.split('-'); return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 864e5); }

  function newState() {
    return { v: 3, lv: {}, xp: 0, streak: 0, last: '', todayXp: 0, todayDate: '', goal: 30, speaks: 0, perfect: 0, looked: 0, acts: 0, bestCombo: 0, badges: [], stickers: [], tips: [], name: '', intro: false, grad: false };
  }
  function touchDay(s) {
    var t = today();
    if (s.todayDate !== t) { s.todayDate = t; s.todayXp = 0; }
    return s;
  }
  function addXp(s, n) { touchDay(s); s.xp += n; s.todayXp += n; }
  function streakAlive(s) { return s.last && dayDiff(s.last, today()) <= 1 ? s.streak : 0; }
  function nextLevel(s) { for (var i = 1; i <= 30; i++) if (!s.lv[i]) return i; return 30; }
  function unlocked(s, id) { return id === 1 || !!s.lv[id - 1] || !!s.lv[id]; }
  function totalStars(s) { var n = 0; for (var k in s.lv) n += s.lv[k].stars; return n; }
  function doneCount(s) { return Object.keys(s.lv).length; }

  // 通关结算，返回新得的徽章、贴纸、能力
  function finishLevel(s, id, stars, info) {
    touchDay(s);
    var first = !s.lv[id];
    var prev = s.lv[id] ? s.lv[id].stars : 0;
    s.lv[id] = { stars: Math.max(prev, stars) };
    var t = today();
    if (s.last !== t) { s.streak = (s.last && dayDiff(s.last, t) === 1) ? s.streak + 1 : 1; s.last = t; }
    if (info && info.combo > s.bestCombo) s.bestCombo = info.combo;
    if (info && info.act) s.acts++;
    var gain = { badges: [], sticker: null, ability: null, xp: 0 };
    var xp = 10 + stars * 5 + (first ? 10 : 0);
    addXp(s, xp); gain.xp = xp;
    var lv = level(id);
    if (first && lv.boss) {
      var stk = STICKERS[lv.stage];
      if (s.stickers.indexOf(lv.stage) < 0) { s.stickers.push(lv.stage); gain.sticker = stk; gain.ability = C.STAGES[lv.stage]; }
    }
    var three = 0; for (var k in s.lv) if (s.lv[k].stars === 3) three++;
    var cond = {
      first: doneCount(s) >= 1, streak3: s.streak >= 3, streak7: s.streak >= 7, perfect10: s.perfect >= 10,
      combo8: s.bestCombo >= 8, look20: s.looked >= 20, star3x5: three >= 5, actor: s.acts >= 5, half: !!s.lv[15], grad: doneCount(s) >= 30
    };
    BADGES.forEach(function (b) { if (cond[b.id] && s.badges.indexOf(b.id) < 0) { s.badges.push(b.id); gain.badges.push(b); } });
    return gain;
  }

  var E = {
    C: C, shuffle: shuffle, words: words, norm: norm, level: level, stage: stage, buildSteps: buildSteps,
    score: score, spoken: spoken, verdict: verdict, starsFor: starsFor, BADGES: BADGES, STICKERS: STICKERS,
    today: today, newState: newState, touchDay: touchDay, addXp: addXp, streakAlive: streakAlive,
    nextLevel: nextLevel, unlocked: unlocked, totalStars: totalStars, doneCount: doneCount, finishLevel: finishLevel
  };
  if (typeof module !== 'undefined') module.exports = E; else root.Engine = E;
})(this);
