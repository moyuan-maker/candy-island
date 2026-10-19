// 本地存档：和网页版同一个键名，合并在 engine.newState() 之上
var E = require('./engine.js');
var KEY = 'candyisland3';
var S = null;

function load() {
  try {
    var s = wx.getStorageSync(KEY);
    if (s && typeof s === 'string') s = JSON.parse(s);
    if (s && s.v === 3) return Object.assign(E.newState(), s);
  } catch (e) {}
  return E.newState();
}
function get() { if (!S) S = load(); return S; }
function save() { try { wx.setStorageSync(KEY, JSON.stringify(get())); } catch (e) {} }
function reset() { S = E.newState(); save(); return S; }

module.exports = { get: get, save: save, reset: reset };
