// 点词弹层：音标 + 释义 + 发音
var W = require('../../utils/words.js');
var store = require('../../utils/store.js');
var speech = require('../../utils/speech.js');
Component({
  options: { addGlobalClass: true },
  data: { show: false, word: '', ipa: '', mean: '', has: false },
  methods: {
    open: function (w) {
      var r = W.glossOf(w), g = r[1];
      var S = store.get(); S.looked++; store.save();
      this.setData({ show: true, word: r[0], ipa: g ? g[0] : '', mean: g ? g[1] : '这是个基础词，听听发音就好～', has: !!g });
      speech.buzz('tap');
      speech.speak(r[0]);
    },
    onSay: function () { speech.speak(this.data.word); },
    onSlow: function () { speech.speak(this.data.word, { rate: 0.6 }); },
    onClose: function () { this.setData({ show: false }); },
    noop: function () {}
  }
});
