// 闯关页：learn / choose / build / fill / act / match 六种步骤 + 结算
var E = require('../../utils/engine.js');
var C = E.C;
var store = require('../../utils/store.js');
var speech = require('../../utils/speech.js');
var W = require('../../utils/words.js');
var draw = require('../../utils/draw.js');
var mic = require('../../utils/mic.js');
var rnd = W.rnd;

var RIGHT = ['答对啦！', '太聪明了！', '漂亮！', '就是这个！', '你好会！'];
var LEARN_TIPS = ['先听我读一遍，再按麦克风跟我说～', '点一下不认识的单词，我告诉你意思哦', '慢一点也没关系，读清楚最重要', '试试模仿我的语气和节奏！'];
var EMO = ['🍓', '🍋', '🫐'];
var praiseSeq = 0;

var page = {
  data: {
    phase: 'step', id: 1, i: 0, n: 1, pct: 0, combo: 0,
    type: '', coachMood: 'happy', coachText: '',
    foot: { kind: 'none' }, rec: false, micLabel: '', praises: [],
    // learn / act
    scene: '', segs: [], long: false, zh: '', isEx: false, keyEn: '', keyZh: '', exSegs: [], exZh: '', mood: null,
    // choose
    opts: [], done: false,
    // build
    hint: '', tiles: [], placed: [], solved: '', slotShake: false, bDone: false,
    // fill
    before: '', after: '', blank: '？', blankPop: false, fopts: [], fzh: '',
    // match
    gems: [], sec: 60, tpct: 100, left: 0,
    // result
    r: null
  },

  onLoad: function (q) {
    var id = parseInt(q && q.id, 10);
    if (!(id >= 1 && id <= 30)) id = 1;
    this.start(id);
  },
  onHide: function () { speech.stopAudio(); },
  onUnload: function () { this._dead = true; this.cleanup(); },
  onShareAppMessage: function () { return { title: '我在口语糖果岛闯第 ' + this.data.id + ' 关 🍬', path: '/pages/index/index' }; },

  cleanup: function () {
    clearInterval(this._tm); this._tm = null;
    if (this._m) this._m.over = true;
    speech.stopAudio(); speech.stopListen();
  },
  later: function (fn, ms) { var self = this; setTimeout(function () { if (!self._dead) fn.call(self); }, ms); },

  start: function (id) {
    this.cleanup();
    var lv = E.level(id);
    this.S = store.get();
    this.L = { id: id, lv: lv, steps: E.buildSteps(id), i: 0, speak: [], games: 0, right: 0, combo: 0, maxCombo: 0, act: false, xp: 0 };
    wx.setNavigationBarTitle({ title: '第 ' + id + ' 关 · ' + C.STAGES[lv.stage].name });
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    this.setData({ phase: 'step', id: id, r: null });
    this.renderStep();
  },
  step: function () { return this.L.steps[this.L.i]; },
  renderStep: function () {
    var st = this.step();
    this['step_' + st.type](st);
  },
  shell: function (mood, text, extra) {
    var L = this.L;
    var d = {
      type: this.step().type, coachMood: mood, coachText: text,
      i: L.i, n: L.steps.length, pct: L.i / L.steps.length * 100, combo: L.combo,
      foot: { kind: 'none' }, rec: false, micLabel: mic.idleLabel()
    };
    for (var k in extra) d[k] = extra[k];
    this.setData(d);
  },
  coach: function (mood, text) {
    var d = { coachMood: mood };
    if (text) d.coachText = text;
    this.setData(d);
  },
  next: function () {
    speech.stopAudio(); speech.stopListen();
    this.L.i++;
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    if (this.L.i >= this.L.steps.length) this.finish(); else this.renderStep();
  },
  praise: function (t) {
    var id = ++praiseSeq, self = this;
    this.setData({ praises: this.data.praises.concat([{ id: id, t: t }]) });
    this.later(function () { self.setData({ praises: self.data.praises.filter(function (p) { return p.id !== id; }) }); }, 1250);
  },
  fx: function () { return this.selectComponent('#fx'); },
  gotIt: function (ok, burst) {
    var L = this.L;
    L.games++;
    if (ok) {
      L.right++; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo); L.xp += 2;
      if (L.combo >= 3) this.praise(L.combo >= 5 ? '无敌连击 ×' + L.combo : '连击 ×' + L.combo);
      speech.buzz('ok');
      if (burst && this.fx()) this.fx().burst(burst[0], burst[1], 14);
    } else { L.combo = 0; speech.buzz('no'); }
    this.setData({ combo: L.combo });
  },
  fb: function (ok, title, en, text, onNext) {
    this._onNext = onNext || null;
    this.setData({ foot: { kind: 'fb', ok: ok, title: title, en: en || '', text: text || '' } });
  },
  onGo: function () { if (this._onNext) this._onNext(); else this.next(); },
  onWord: function (e) {
    var w = e.currentTarget.dataset.w;
    if (!w) return;
    var ws = this.selectComponent('#ws'); if (ws) ws.open(w);
  },
  onClose: function () {
    var self = this;
    var back = function () {
      self.cleanup();
      if (getCurrentPages().length > 1) wx.navigateBack(); else wx.reLaunch({ url: '/pages/index/index' });
    };
    if (this.data.phase === 'result' || this.L.i === 0) return back();
    wx.showModal({ title: '要退出吗？', content: '现在退出，这一关的进度不会保存哦', confirmText: '退出', cancelText: '继续闯关', success: function (r) { if (r.confirm) back(); } });
  },

  /* ---------- 学习 + 跟读 ---------- */
  step_learn: function (st) {
    var L = this.L, it = st.item, isEx = st.text === it.ex, self = this;
    this._micText = st.text; this._best = 0;
    this._onScore = function (s, marks) { self.learnScore(s, marks, st); };
    this.shell(L.i === 0 ? 'cheer' : 'happy', L.i === 0 ? '第 ' + L.id + ' 关开始啦！' + rnd(LEARN_TIPS) : rnd(LEARN_TIPS), {
      scene: it.scene, segs: W.segs(st.text), long: st.text.length > 28, zh: isEx ? it.exzh : it.zh,
      isEx: isEx, keyEn: it.en, keyZh: it.zh, exSegs: isEx ? [] : W.segs(it.ex), exZh: it.exzh,
      foot: { kind: 'skip', skip: '现在不方便开口，跳过' }
    });
    this.later(function () { speech.speak(st.text); }, 350);
  },
  onPlay: function () { speech.speak(this._micText); },
  onSlow: function () { speech.speak(this._micText, { rate: 0.6 }); },
  onPlayEx: function () { speech.speak(this.step().item.ex); },
  onSkip: function () {
    if (this.step().type === 'learn') this.L.speak.push(50);
    this.next();
  },
  learnScore: function (s, marks, st) {
    var L = this.L, S = this.S;
    S.speaks++; this._best = Math.max(this._best, s);
    var d = {};
    if (marks) d.segs = W.segs(st.text, marks);
    var v = E.verdict(s);
    if (s >= 85) {
      S.perfect++; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo); L.xp += 3;
      if (this.fx()) this.fx().burst(50, 72, 18);
      this.praise(v.title); speech.buzz('win');
    } else if (s >= 60) { L.xp += 2; speech.buzz('ok'); } else { L.xp += 1; speech.buzz('tap'); }
    this.coach(s >= 85 ? 'love' : s >= 60 ? 'cheer' : 'happy', rnd(v.say) + (s < 60 ? ' 红色的词再听我读一遍～' : ''));
    store.save();
    d.combo = L.combo;
    d.foot = { kind: 'score', score: s, title: v.title, tier: v.tier };
    this.setData(d);
  },
  onAgain: function () { this.onMic(); },
  onNextLearn: function () { this.L.speak.push(this._best); this.next(); },

  /* ---------- 听音选意 ---------- */
  step_choose: function (st) {
    this.shell('think', '小测验！听一听，这句是什么意思？', {
      opts: st.options.map(function (o, i) { return { t: o, e: EMO[i] || '🍬', c: '' }; }), done: false
    });
    this.later(function () { speech.speak(st.text); }, 300);
  },
  onListen: function () { speech.speak(this.step().text); },
  onOpt: function (e) {
    if (this.data.done) return;
    var st = this.step(), i = +e.currentTarget.dataset.i, ok = st.options[i] === st.answer;
    var opts = this.data.opts.map(function (o, k) {
      var c = st.options[k] === st.answer ? 'right' : (k === i ? 'wrong shake' : '');
      return { t: o.t, e: o.e, c: c };
    });
    this.setData({ opts: opts, done: true });
    this.gotIt(ok, ok ? [50, 55] : null);
    this.coach(ok ? 'cheer' : 'happy', ok ? rnd(RIGHT) : '没关系，记住它就赚到了！');
    this.fb(ok, ok ? rnd(RIGHT) : '正确答案在绿色那个～', st.text, st.text === st.item.ex ? st.item.exzh : st.item.zh);
  },

  /* ---------- 糖果拼句 ---------- */
  step_build: function (st) {
    var hint = st.text === st.item.ex ? st.item.exzh : st.item.zh;
    this.shell('happy', '糖果拼句！按顺序点糖果，拼出这句话 🍬', {
      hint: hint, tiles: st.tiles.map(function (t, k) { return { w: t.w, c: 'c' + (k % 6), used: false }; }),
      placed: [], solved: '', slotShake: false, bDone: false
    });
  },
  onTile: function (e) {
    var st = this.step(), k = +e.currentTarget.dataset.k, tiles = this.data.tiles, placed = this.data.placed;
    if (this.data.bDone || tiles[k].used || placed.length >= st.answer.length) return;
    speech.buzz('tap');
    var d = {};
    d['tiles[' + k + '].used'] = true;
    d.placed = placed.concat([{ k: k, w: tiles[k].w, c: tiles[k].c, boom: false, delay: 0 }]);
    this.setData(d, this.buildCheck.bind(this));
  },
  onPlaced: function (e) {
    if (this.data.bDone) return;
    var idx = +e.currentTarget.dataset.idx, p = this.data.placed[idx];
    var placed = this.data.placed.slice(); placed.splice(idx, 1);
    var d = { placed: placed };
    d['tiles[' + p.k + '].used'] = false;
    this.setData(d);
  },
  buildCheck: function () {
    var st = this.step(), placed = this.data.placed;
    if (placed.length < st.answer.length) return;
    var ok = placed.every(function (p, i) { return E.norm(st.tiles[p.k].w) === E.norm(st.answer[i]); });
    var hint = this.data.hint;
    if (ok) {
      this.setData({ bDone: true, placed: placed.map(function (p, i) { return { k: p.k, w: p.w, c: p.c, boom: true, delay: i * 110 }; }) });
      this.later(function () { this.setData({ solved: st.text }); speech.speak(st.text); }, placed.length * 110 + 350);
      this.gotIt(true, [50, 40]);
      this.coach('cheer', '消除成功！整句都拼对啦');
      this.fb(true, rnd(RIGHT), '', hint);
    } else {
      this.setData({ bDone: true, slotShake: true });
      this.later(function () { this.setData({ slotShake: false }); }, 450);
      this.gotIt(false);
      this.coach('think', '顺序有点乱，看看正确的是哪样～');
      this.fb(false, '正确顺序是：', st.text, '');
      speech.speak(st.text);
    }
  },

  /* ---------- 填空泡泡 ---------- */
  step_fill: function (st) {
    this.shell('happy', '泡泡填空！选一个词放进空格里 🫧', {
      before: st.before, after: st.after, blank: '？', blankPop: false, done: false, fzh: st.item.exzh,
      fopts: st.options.map(function (o, i) { return { t: o, c: 'c' + ((i * 2 + 1) % 6), x: '' }; })
    });
  },
  onFill: function (e) {
    if (this.data.done) return;
    var st = this.step(), i = +e.currentTarget.dataset.i, ok = E.norm(st.options[i]) === E.norm(st.answer);
    var d = { blank: st.answer, blankPop: true, done: true };
    if (!ok) d['fopts[' + i + '].x'] = 'shake';
    this.setData(d);
    this.gotIt(ok, ok ? [50, 62] : null);
    this.coach(ok ? 'cheer' : 'happy', ok ? rnd(RIGHT) : '答案是 ' + st.answer + '，下次就记住啦');
    speech.speak(st.item.ex);
    this.fb(ok, ok ? rnd(RIGHT) : '差一点！', '', '重点表达：' + st.item.en + '  ' + st.item.zh);
  },

  /* ---------- 演技挑战 ---------- */
  step_act: function (st) {
    var m = st.mood, it = st.item, self = this;
    this._micText = st.text;
    this._onScore = function (s, marks) { self.actScore(s, marks, st); };
    this.shell('wow', '🎭 演技挑战！用「' + m.e + ' ' + m.t + '」的语气读这句，越夸张越好～', {
      mood: m, segs: W.segs(st.text), zh: st.text === it.ex ? it.exzh : it.zh,
      foot: { kind: 'skip', skip: '害羞，跳过这题' }
    });
    this.later(function () { this.onDemo(); }, 400);
  },
  onDemo: function () {
    var m = this.step().mood;
    speech.speak(this._micText, { rate: m.rate, vol: m.vol });
  },
  actScore: function (s, marks, st) {
    var L = this.L, S = this.S;
    S.speaks++; L.act = true; L.xp += 5; store.save();
    if (marks) this.setData({ segs: W.segs(st.text, marks) });
    if (this.fx()) this.fx().rain();
    speech.buzz('win');
    this.praise(rnd(['影后级表演！', '戏精本精！', '奥斯卡欠你一座！']));
    this.coach('love', '哈哈哈太有戏了！演技挑战 +5 XP');
    L.speak.push(Math.max(s, 70));
    this.fb(true, '🎬 表演满分！', '', '识别得分 ' + s + '，多加点戏，口语会越说越放松～');
  },

  /* ---------- 糖果消消乐 ---------- */
  step_match: function (st) {
    var self = this;
    this._m = { sel: -1, left: st.items.length, miss: 0, streak: 0, sec: st.seconds, over: false };
    this.shell('wow', '🍬 糖果消消乐！把英文和中文配成一对，60 秒内全部消除！', {
      gems: st.tiles.map(function (t) { return { t: t.t, lang: t.lang, c: 'c' + ((t.k * 7 + (t.lang === 'en' ? 0 : 3)) % 6), s: '' }; }),
      sec: st.seconds, tpct: 100, left: st.items.length
    });
    clearInterval(this._tm);
    this._tm = setInterval(function () {
      var m = self._m;
      if (!m || m.over || self._dead) { clearInterval(self._tm); return; }
      m.sec--;
      self.setData({ sec: m.sec, tpct: m.sec / st.seconds * 100 });
      if (m.sec <= 0) self.matchEnd(false);
    }, 1000);
  },
  onGem: function (e) {
    var m = this._m, st = this.step();
    if (!m || m.over) return;
    var k = +e.currentTarget.dataset.k, g = this.data.gems[k];
    if (g.s === 'gone') return;
    var t = st.tiles[k];
    if (t.lang === 'en') speech.speak(t.t);
    var d = {};
    if (m.sel < 0) { m.sel = k; d['gems[' + k + '].s'] = 'sel'; speech.buzz('tap'); this.setData(d); return; }
    if (m.sel === k) { m.sel = -1; d['gems[' + k + '].s'] = ''; this.setData(d); return; }
    var a = st.tiles[m.sel], s1 = m.sel, L = this.L;
    m.sel = -1;
    if (a.k === t.k && a.lang !== t.lang) {
      d['gems[' + s1 + '].s'] = 'gone'; d['gems[' + k + '].s'] = 'gone';
      m.streak++; m.left--; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo);
      d.left = m.left; d.combo = L.combo;
      this.setData(d);
      if (this.fx()) this.fx().burst(50, 50, 12);
      if (m.streak >= 2) this.praise('连消 ×' + m.streak);
      speech.buzz('ok');
      if (!m.left) this.later(function () { this.matchEnd(true); }, 450);
    } else {
      d['gems[' + s1 + '].s'] = 'shake'; d['gems[' + k + '].s'] = 'shake';
      m.miss++; m.streak = 0; L.combo = 0; d.combo = 0;
      this.setData(d);
      speech.buzz('no');
      this.later(function () {
        var r = {};
        if (this.data.gems[s1].s === 'shake') r['gems[' + s1 + '].s'] = '';
        if (this.data.gems[k].s === 'shake') r['gems[' + k + '].s'] = '';
        this.setData(r);
      }, 420);
    }
  },
  matchEnd: function (cleared) {
    var m = this._m, st = this.step(), L = this.L;
    if (!m || m.over) return;
    m.over = true; clearInterval(this._tm); this._tm = null;
    var acc = st.items.length / (st.items.length + m.miss);
    L.games += 2; L.right += cleared ? Math.round(acc * 2) : 0;
    if (cleared) {
      var bonus = 5 + Math.floor(m.sec / 10);
      if (this.fx()) this.fx().rain();
      speech.buzz('win');
      this.praise(m.sec > 30 ? '闪电消除！' : '全部消除！');
      L.xp += bonus;
      this.coach('love', '全部消除！还剩 ' + m.sec + ' 秒，奖励 +' + bonus + ' XP');
    } else {
      this.coach('happy', '时间到～剩下的已经帮你翻开了，看一眼记住它们');
      this.setData({ gems: this.data.gems.map(function (g) { return { t: g.t, lang: g.lang, c: g.c, s: g.s === 'gone' ? 'gone' : 'flag' }; }) });
    }
    this.fb(cleared, cleared ? '🎉 消消乐通关！' : '时间到啦', '', cleared ? '失误 ' + m.miss + ' 次' + (m.miss === 0 ? '，完美！' : '') : '下次一定能全部消掉！');
  },

  /* ---------- 结算 ---------- */
  finish: function () {
    var L = this.L, S = this.S;
    this.cleanup();
    var avg = L.speak.length ? L.speak.reduce(function (a, b) { return a + b; }, 0) / L.speak.length : 60;
    var acc = L.games ? L.right / L.games : 1;
    var stars = E.starsFor(avg, acc);
    E.addXp(S, L.xp);
    var gain = E.finishLevel(S, L.id, stars, { combo: L.maxCombo, act: L.act });
    store.save();
    var lv = L.lv, stg = C.STAGES[lv.stage], self = this;
    wx.setNavigationBarTitle({ title: '第 ' + L.id + ' 关 通关！' });
    this.setData({
      phase: 'result', type: '', praises: [],
      r: {
        id: L.id, stars: stars, xp: gain.xp + L.xp, avg: Math.round(avg), maxCombo: L.maxCombo,
        sticker: gain.sticker, ability: gain.ability ? { unlock: gain.ability.unlock, detail: gain.ability.detail } : null,
        badges: gain.badges, tipT: lv.tip.t, tipB: lv.tip.b, last: L.id >= 30
      }
    }, function () {
      draw.getCanvas(self, '#share').then(function (cv) {
        if (!cv || self._dead) return;
        self._shareCv = cv;
        draw.drawShare(cv, { id: L.id, stars: stars, icon: stg.icon, stage: stg.name, streak: E.streakAlive(S), done: E.doneCount(S) });
      });
    });
    this.later(function () { if (this.fx()) this.fx().rain(); speech.buzz('win'); }, 300);
  },
  onSaveShare: function () { draw.saveCanvas(this._shareCv); },
  onReplay: function () { this.start(this.L.id); },
  onNextLv: function () {
    var id = this.L.id;
    if (id >= 30) wx.redirectTo({ url: '/pages/grad/grad' });
    else this.start(id + 1);
  },
  onHome: function () {
    if (getCurrentPages().length > 1) wx.navigateBack(); else wx.reLaunch({ url: '/pages/index/index' });
  }
};

Page(Object.assign({}, mic.methods, page));
