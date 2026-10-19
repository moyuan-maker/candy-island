// 跟读麦克风的共用页面方法（闯关页、毕业页共用）
// 页面需提供：this._micText（要读的句子）、this._onScore(score, marks)、this.coach(mood, text)、this._dead
var E = require('./engine.js');
var speech = require('./speech.js');

function idleLabel() { return speech.canListen() ? '按一下，跟我读' : '大声读出来吧'; }

var methods = {
  onMic: function () {
    var self = this, text = this._micText;
    if (this.data.rec) { speech.stopListen(); return; }
    speech.stopAudio();
    if (!speech.canListen()) return this.selfRate();
    this.setData({ rec: true, micLabel: '我在听… 读完点一下' });
    this.coach('think', '我在认真听哦～');
    speech.listen(text).then(function (r) {
      if (self._dead) return;
      self.setData({ rec: false, micLabel: '再读一次' });
      if (r.mode === 'none' || r.fatal) {
        self.setData({ micLabel: '大声读出来吧' });
        wx.showToast({ title: r.err === 'not-allowed' ? '麦克风没打开，先用自评模式' : '语音打分暂时连不上，先用自评模式', icon: 'none' });
        return self.selfRate();
      }
      if (!r.text) {
        self.coach('think', '我好像没听到，大点声再来一次？');
        speech.buzz('no');
        self.setData({ 'foot.selfOk': true });
        return;
      }
      var sc = E.score(text, r.text);
      self._onScore(sc.score, sc.marks, r.text);
    });
  },
  selfRate: function () {
    this.coach('happy', '和我读的比一比，你觉得怎么样？');
    this.setData({ foot: { kind: 'self' } });
  },
  onSelfOk: function () { this.selfRate(); },
  onRate: function (e) { this._onScore(+e.currentTarget.dataset.s, null); }
};

module.exports = { methods: methods, idleLabel: idleLabel };
