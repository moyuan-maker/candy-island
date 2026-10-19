// 毕业：6 句英文 vlog 开场提词器跟读 → 杂志封面 SHE SPEAKS
var E = require('../../utils/engine.js');
var C = E.C;
var store = require('../../utils/store.js');
var speech = require('../../utils/speech.js');
var W = require('../../utils/words.js');
var draw = require('../../utils/draw.js');
var mic = require('../../utils/mic.js');

var page = {
  data: {
    phase: 'line', i: 0, total: 6, pct: 0, coachMood: 'wow', coachText: '', segs: [], zh: '',
    foot: { kind: 'none' }, rec: false, micLabel: '', name: '', hasPhoto: false
  },
  onLoad: function () {
    this.S = store.get();
    this.scores = [];
    this.photo = null;
    this.line(0);
  },
  onHide: function () { speech.stopAudio(); },
  onUnload: function () { this._dead = true; speech.stopAudio(); speech.stopListen(); },
  onShareAppMessage: function () { return { title: '30 天，我开口说英语了 ✨', path: '/pages/index/index' }; },
  later: function (fn, ms) { var self = this; setTimeout(function () { if (!self._dead) fn.call(self); }, ms); },
  coach: function (mood, text) { var d = { coachMood: mood }; if (text) d.coachText = text; this.setData(d); },

  line: function (i) {
    if (i >= C.GRAD.length) return this.cover();
    var t = C.GRAD[i], self = this;
    this._i = i; this._micText = t;
    this._onScore = function (s, marks) { self.lineScore(s, marks, t, i); };
    wx.setNavigationBarTitle({ title: '🎬 主角时刻 ' + (i + 1) + '/6' });
    this.setData({
      phase: 'line', i: i, total: C.GRAD.length, pct: i / C.GRAD.length * 100,
      coachMood: 'wow', coachText: '主角时刻！这是你的第一条英文 vlog 开场，对着镜头读出来 🎥',
      segs: W.segs(t), zh: C.GRADZH[i], foot: { kind: 'none' }, rec: false, micLabel: mic.idleLabel()
    });
    this.later(function () { speech.speak(t); }, 300);
  },
  onPlay: function () { speech.speak(this._micText); },
  onWord: function (e) {
    var w = e.currentTarget.dataset.w;
    if (!w) return;
    var ws = this.selectComponent('#ws'); if (ws) ws.open(w);
  },
  lineScore: function (s, marks, t, i) {
    var S = this.S;
    var d = {};
    if (marks) d.segs = W.segs(t, marks);
    this.scores.push(s); S.speaks++; store.save();
    var fx = this.selectComponent('#fx'); if (fx) fx.burst(50, 70, 16);
    speech.buzz('ok');
    this.coach('love', s >= 80 ? '这条可以直接发！' : '镜头感满满～');
    d.foot = { kind: 'next', label: i < C.GRAD.length - 1 ? '下一句 →' : '🎬 杀青！生成封面' };
    this.setData(d);
  },
  onNextLine: function () { speech.stopAudio(); this.line(this._i + 1); },
  onClose: function () {
    speech.stopAudio(); speech.stopListen();
    if (getCurrentPages().length > 1) wx.navigateBack(); else wx.reLaunch({ url: '/pages/index/index' });
  },

  cover: function () {
    var S = this.S, self = this;
    S.grad = true; store.save();
    wx.setNavigationBarTitle({ title: 'SHE SPEAKS · 封面大片' });
    this.setData({ phase: 'cover', name: S.name }, function () {
      draw.getCanvas(self, '#cv').then(function (cv) { self._cv = cv; self.redraw(); });
    });
    var fx = this.selectComponent('#fx'); if (fx) fx.rain();
    speech.buzz('win');
  },
  redraw: function () {
    var S = this.S;
    if (!this._cv || this._dead) return;
    draw.drawCover(this._cv, { name: S.name || 'YOU', photo: this.photo, real: true, stars: E.totalStars(S), speaks: S.speaks });
  },
  onName: function (e) {
    this.S.name = String(e.detail.value || '').trim(); store.save();
    var self = this;
    clearTimeout(this._nt);
    this._nt = setTimeout(function () { self.redraw(); }, 250);
  },
  onPhoto: function () {
    var self = this;
    var done = function (path) { if (!path) return; self.photo = path; self.setData({ hasPhoto: true }); self.redraw(); };
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1, mediaType: ['image'], sourceType: ['album', 'camera'], sizeType: ['compressed'],
        success: function (r) { done(r.tempFiles && r.tempFiles[0] && r.tempFiles[0].tempFilePath); }
      });
    } else {
      wx.chooseImage({ count: 1, sizeType: ['compressed'], success: function (r) { done(r.tempFilePaths && r.tempFilePaths[0]); } });
    }
  },
  onSave: function () { draw.saveCanvas(this._cv); },
  onDone: function () { this.onClose(); }
};

Page(Object.assign({}, mic.methods, page));
