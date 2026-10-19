// 首页：旅程地图 / 30天后的我 / 我的收藏（页内标签切换）+ 首次打开引导
var E = require('../../utils/engine.js');
var C = E.C;
var store = require('../../utils/store.js');
var speech = require('../../utils/speech.js');
var W = require('../../utils/words.js');
var draw = require('../../utils/draw.js');

var GREET = ['今天也来闯一关吧！', '10 分钟就好，我陪你～', '昨天学的还记得吗？', '每天一点点，开口不再怕！', '冲鸭！今天的你比昨天更会说～'];
var FUTURE = [
  ['☕', '早上，在咖啡馆用英语点单', '“Can I get an oat latte, please?” 再补一句 “This place has such good vibes.” 店员冲你笑了。'],
  ['🛍️', '和闺蜜逛街，看到心动的包', '“I’ve had my eye on this for months!” 一句话说出口，自己都觉得好自然。'],
  ['✈️', '一个人去旅行，也不慌', '问路、点餐、和民宿老板聊两句，不用一直举着翻译软件。'],
  ['📱', '刷喜欢的博主 vlog', '“Not gonna lie”“Low-key obsessed”… 那些口头禅，一听就懂，还能跟着说。'],
  ['🎬', '拍下你的第一条英文 vlog', '对着镜头说 30 秒英语，朋友圈里那个闪闪发光的女生，就是你。']
];

// 地图布局（单位 rpx）：路径区宽 686，中线 343
var OFFS = [0, 140, 200, 120, -20, -120], H = 216, CX = 343;

function buildStage(S, st, si, cur) {
  var nodes = [], pts = [], here = null, dots = [];
  for (var i = 0; i < 6; i++) {
    var id = st.from + i, lv = E.level(id), d = S.lv[id], un = E.unlocked(S, id), isCur = id === cur && !d;
    var size = lv.boss ? 160 : 132, x = OFFS[i], y = i * H + 52;
    pts.push([CX + x, y + size / 2]);
    nodes.push({
      id: id, left: CX + x - size / 2, top: y, size: size, boss: lv.boss, lock: !un, cur: isCur,
      label: un ? (lv.boss ? (d ? '🏆' : '🎁') : String(id)) : '🔒', done: !!d, stars: d ? d.stars : 0
    });
    if (isCur) here = { left: CX + x + (x > 80 ? -size / 2 - 150 : size / 2 + 8), top: y - 64 };
  }
  // 节点之间的虚线小圆点（沿二次贝塞尔曲线取点）
  for (var j = 1; j < pts.length; j++) {
    var p0 = pts[j - 1], p1 = pts[j], cx = (p0[0] + p1[0]) / 2 + 60, cy = (p0[1] + p1[1]) / 2;
    [0.32, 0.44, 0.56, 0.68].forEach(function (t) {
      var a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      dots.push({ x: Math.round(a * p0[0] + b * cx + c * p1[0] - 8), y: Math.round(a * p0[1] + b * cy + c * p1[1] - 8) });
    });
  }
  return {
    si: si, no: si + 1, name: st.name, en: st.en, icon: st.icon, color: st.color, unlock: st.unlock,
    h: 6 * H + 60, nodes: nodes, dots: dots, here: here
  };
}

Page({
  data: {
    tab: 'map', buzzOn: true, showIntro: false, introName: '',
    top: { streak: 0, stars: 0, xp: 0 },
    map: null, future: null, me: null
  },

  onLoad: function () {
    var S = store.get();
    if (!S.intro) this.setData({ showIntro: true });
    this.setData({ buzzOn: getApp().globalData.buzzOn !== false });
  },
  onShow: function () { this.render(); },
  onHide: function () { this._gradPlaying = false; speech.stopAudio(); },
  onUnload: function () { this._dead = true; speech.stopAudio(); },
  onShareAppMessage: function () { return { title: '每天 10 分钟，30 天开口说英语 🍬', path: '/pages/index/index' }; },

  render: function () {
    var S = store.get();
    E.touchDay(S);
    var cur = E.nextLevel(S), tipLv = E.level(cur), done = E.doneCount(S);
    var pct = Math.min(100, S.todayXp / S.goal * 100);
    var map = {
      cur: cur,
      mood: pct >= 100 ? 'love' : 'happy',
      hello: (S.name ? S.name + '，' : '') + (pct >= 100 ? '今天的目标完成啦，你超棒！' : W.rnd(GREET)),
      pct: pct, goalTxt: Math.min(S.todayXp, S.goal) + '/' + S.goal,
      opened: S.tips.indexOf(cur) >= 0, tipT: tipLv.tip.t, tipB: tipLv.tip.b,
      stages: C.STAGES.map(function (st, si) { return buildStage(S, st, si, cur); }),
      all: done >= 30, left: 30 - done
    };
    var future = {
      done: done, left: 30 - done, unlocked: done >= 30,
      cards: FUTURE.map(function (f) { return { e: f[0], t: f[1], d: f[2] }; }),
      stamps: C.STAGES.map(function (s, i) { return { icon: s.icon, name: s.name, unlock: s.unlock, on: S.stickers.indexOf(i) >= 0 }; }),
      grad: C.GRAD.map(function (g, i) { return { en: g, zh: C.GRADZH[i] }; })
    };
    var me = {
      done: done, streak: E.streakAlive(S), speaks: S.speaks, name: S.name,
      badges: E.BADGES.map(function (b) { return { e: b.e, t: b.t, d: b.d, on: S.badges.indexOf(b.id) >= 0 }; }),
      stamps: future.stamps
    };
    var self = this;
    this.setData({
      top: { streak: E.streakAlive(S), stars: E.totalStars(S), xp: S.xp },
      map: map, future: future, me: me
    }, function () {
      if (self.data.tab === 'future') self.drawFutureCover();
      if (self.data.tab === 'map' && !self._scrolled && cur > 1) {
        self._scrolled = true;
        setTimeout(function () { if (!self._dead) wx.pageScrollTo({ selector: '#curnode', offsetTop: -260, duration: 400 }); }, 300);
      }
    });
  },

  /* ---------- 顶栏 / 标签 ---------- */
  onTab: function (e) {
    var v = e.currentTarget.dataset.v, self = this;
    if (v === this.data.tab) return;
    speech.buzz('tap');
    this._gradPlaying = false; speech.stopAudio();
    this.setData({ tab: v }, function () {
      wx.pageScrollTo({ scrollTop: 0, duration: 0 });
      if (v === 'future') self.drawFutureCover();
    });
  },
  onBuzz: function () {
    var app = getApp(), on = !(app.globalData.buzzOn !== false);
    app.globalData.buzzOn = on;
    this.setData({ buzzOn: on });
    wx.showToast({ title: on ? '震动反馈已打开' : '震动反馈已关闭', icon: 'none' });
  },

  /* ---------- 地图 ---------- */
  onNode: function (e) {
    var id = +e.currentTarget.dataset.id, S = store.get();
    if (!E.unlocked(S, id)) { wx.showToast({ title: '先通过前一关才能解锁哦', icon: 'none' }); speech.buzz('no'); return; }
    speech.buzz('tap');
    wx.navigateTo({ url: '/pages/lesson/lesson?id=' + id });
  },
  onCookie: function () {
    var S = store.get(), cur = E.nextLevel(S);
    if (S.tips.indexOf(cur) >= 0) return;
    S.tips.push(cur); store.save();
    speech.buzz('win');
    var fx = this.selectComponent('#fx'); if (fx) fx.burst(20, 22, 14);
    this.render();
  },
  onFinale: function () {
    if (this.data.map && this.data.map.all) wx.navigateTo({ url: '/pages/grad/grad' });
    else wx.showToast({ title: '一关一关来，终点在等你 ✨', icon: 'none' });
  },

  /* ---------- 30 天后的我 ---------- */
  drawFutureCover: function () {
    var S = store.get(), self = this;
    draw.getCanvas(this, '#futureCover').then(function (cv) {
      if (!cv || self._dead) return;
      draw.drawCover(cv, { name: S.name || '你的名字', photo: null, real: E.doneCount(S) >= 30, stars: E.totalStars(S), speaks: S.speaks });
    });
  },
  onPlayGrad: function () {
    var self = this;
    if (this._gradPlaying) { this._gradPlaying = false; speech.stopAudio(); return; }
    if (!speech.hasTTS()) { wx.showToast({ title: '朗读需要「微信同声传译」插件', icon: 'none' }); return; }
    this._gradPlaying = true;
    var i = 0;
    (function nextLine() {
      if (!self._gradPlaying || self._dead || i >= C.GRAD.length) { self._gradPlaying = false; return; }
      speech.speak(C.GRAD[i++]).then(nextLine);
    })();
  },
  onGoNow: function () { wx.navigateTo({ url: '/pages/lesson/lesson?id=' + E.nextLevel(store.get()) }); },

  /* ---------- 我的收藏 ---------- */
  onName: function (e) {
    var S = store.get(), v = String(e.detail.value || '').trim();
    if (v === S.name) return;
    S.name = v; store.save();
    wx.showToast({ title: '名字已保存 ✨', icon: 'none' });
  },
  onReset: function () {
    var self = this;
    wx.showModal({
      title: '重新开始', content: '确定清空全部进度吗？', confirmColor: '#e0558f',
      success: function (r) { if (r.confirm) { store.reset(); self._scrolled = false; self.render(); } }
    });
  },

  /* ---------- 首次打开 ---------- */
  onIntroInput: function (e) { this._introName = e.detail.value; },
  onIntroGo: function () {
    var S = store.get();
    S.name = String(this._introName || '').trim(); S.intro = true; store.save();
    this.setData({ showIntro: false });
    speech.buzz('win');
    var fx = this.selectComponent('#fx'); if (fx) fx.rain();
    this.render();
  },
  noop: function () {}
});
