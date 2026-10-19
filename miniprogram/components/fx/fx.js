// 彩纸雨 / 小爆炸：纯 CSS 动画的 emoji 和糖果小点
var COLORS = ['#ff7eb3', '#ffd54f', '#7fd0ff', '#6fd8a0', '#b99bff', '#ffb38a'];
var EMO = ['🍬', '💖', '⭐', '🍭', '✨', '🌸'];
var seq = 0;
Component({
  data: { parts: [] },
  detached: function () { this._dead = true; },
  methods: {
    _add: function (ps, ms) {
      var self = this;
      this.setData({ parts: this.data.parts.concat(ps) });
      var ids = ps.map(function (p) { return p.id; });
      setTimeout(function () {
        if (self._dead) return;
        self.setData({ parts: self.data.parts.filter(function (p) { return ids.indexOf(p.id) < 0; }) });
      }, ms);
    },
    // 满屏彩纸雨
    rain: function () {
      var ps = [];
      for (var i = 0; i < 40; i++) {
        var emoji = i % 3 === 0;
        ps.push({
          id: ++seq, k: 'rain ' + (emoji ? 'emo' : (i % 2 ? 'rect' : 'dot')), l: Math.random() * 96, t: -8,
          d: (Math.random() * 0.9).toFixed(2), dur: (1.8 + Math.random() * 1.4).toFixed(2),
          e: emoji ? EMO[i % 6] : '', bg: emoji ? 'transparent' : COLORS[i % 6], s: Math.round(14 + Math.random() * 14)
        });
      }
      this._add(ps, 3600);
    },
    // 在屏幕某处（百分比坐标）炸开一小团
    burst: function (x, y, n) {
      n = n || 12;
      var ps = [];
      for (var i = 0; i < n; i++) {
        var emoji = i % 3 === 0;
        ps.push({
          id: ++seq, k: 'burst f' + (i % 8) + ' ' + (emoji ? 'emo' : 'dot'), l: x, t: y,
          d: (Math.random() * 0.12).toFixed(2), dur: (0.6 + Math.random() * 0.4).toFixed(2),
          e: emoji ? EMO[i % 6] : '', bg: emoji ? 'transparent' : COLORS[i % 6], s: Math.round(12 + Math.random() * 12)
        });
      }
      this._add(ps, 1300);
    }
  }
});
