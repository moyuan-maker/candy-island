// 单词切分 + 点查词典（与网页版 glossOf / wordsHtml 同一套规则）
var C = require('./content.js');
var GLOSS = C.GLOSS;
var RE = /[A-Za-z0-9][A-Za-z0-9’'\-]*/g;

function glossOf(w) {
  w = String(w).toLowerCase().replace(/’/g, "'").replace(/^'+|'+$/g, '');
  if (GLOSS[w]) return [w, GLOSS[w]];
  var sufs = ['s', 'es', 'ed', 'd', 'ing'];
  for (var i = 0; i < sufs.length; i++) {
    var suf = sufs[i];
    var b = w.length > suf.length && w.slice(-suf.length) === suf && w.slice(0, -suf.length);
    if (b && GLOSS[b]) return [b, GLOSS[b]];
  }
  return [w, null];
}

// 把句子拆成可点击的片段；marks 为 engine.score 返回的逐词对错
function segs(sent, marks) {
  var out = [], k = 0, last = 0, m;
  RE.lastIndex = 0;
  while ((m = RE.exec(sent))) {
    if (m.index > last) out.push({ t: sent.slice(last, m.index), w: '', c: '' });
    var w = m[0], c = 'w';
    if (glossOf(w)[1]) c += ' g';
    if (marks) { if (marks[k] === true) c += ' ok'; else if (marks[k] === false) c += ' miss'; }
    k++;
    out.push({ t: w, w: w, c: c });
    last = RE.lastIndex;
  }
  if (last < sent.length) out.push({ t: sent.slice(last), w: '', c: '' });
  return out;
}

function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }

module.exports = { glossOf: glossOf, segs: segs, rnd: rnd };
