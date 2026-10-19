// 朗读（TTS）+ 跟读识别（ASR），基于「微信同声传译」插件 WechatSI。
// 插件不可用时：朗读静默跳过，跟读自动降级为自评。
var plugin = null;
try {
  if (typeof requirePlugin === 'function') plugin = requirePlugin('WechatSI');
} catch (e) { plugin = null; }

var cache = {};      // text -> { file, exp }
var cur = null;      // 正在播放的一次朗读
var broken = false;  // 识别不可用（没权限 / 连续失败）
var errCount = 0;

function hasTTS() { return !!(plugin && plugin.textToSpeech); }
function canListen() { return !broken && !!(plugin && plugin.getRecordRecognitionManager); }

function tts(text) {
  return new Promise(function (resolve, reject) {
    var c = cache[text], now = Date.now() / 1000;
    if (c && c.exp > now + 30) return resolve(c.file);
    plugin.textToSpeech({
      lang: 'en_US', tts: true, content: text,
      success: function (res) {
        if (res && res.retcode === 0 && res.filename) {
          cache[text] = { file: res.filename, exp: res.expired_time || (now + 3600) };
          resolve(res.filename);
        } else reject(res);
      },
      fail: reject
    });
  });
}

function stopAudio() {
  var c = cur; cur = null;
  if (!c) return;
  if (c.ctx) { try { c.ctx.stop(); c.ctx.destroy(); } catch (e) {} }
  c.finish();
}

// opt: { rate: 播放倍速(0.5~2), vol: 音量 0~1 }，返回 Promise，读完 resolve
function speak(text, opt) {
  opt = opt || {};
  stopAudio();
  return new Promise(function (resolve) {
    var me = { done: false };
    me.finish = function () { if (me.done) return; me.done = true; clearTimeout(me.timer); resolve(); };
    if (!hasTTS() || !text) return me.finish();
    cur = me;
    me.timer = setTimeout(function () { if (cur === me) stopAudio(); else me.finish(); }, 5000 + text.length * 260);
    tts(text).then(function (file) {
      if (cur !== me) return;
      var a = wx.createInnerAudioContext();
      me.ctx = a;
      var end = function () { if (cur === me) { cur = null; try { a.destroy(); } catch (e) {} me.finish(); } };
      a.onEnded(end); a.onError(end);
      if (opt.vol != null) a.volume = opt.vol;
      var r = opt.rate || 1;
      if (r !== 1) { try { a.playbackRate = Math.max(0.5, Math.min(2, r)); } catch (e) {} }
      a.src = file;
      a.play();
    }, function () { if (cur === me) { cur = null; me.finish(); } });
  });
}

// ---------- 跟读识别 ----------
var mgr = null, handler = null;
function manager() {
  if (!mgr && plugin && plugin.getRecordRecognitionManager) {
    mgr = plugin.getRecordRecognitionManager();
    mgr.onStop = function (res) { var h = handler; if (h) h.stop(res); };
    mgr.onError = function (res) { var h = handler; if (h) h.error(res); };
  }
  return mgr;
}

function ensureRecordAuth() {
  return new Promise(function (resolve) {
    wx.getSetting({
      success: function (s) {
        var st = s.authSetting || {};
        if (st['scope.record'] === true) return resolve(true);
        if (st['scope.record'] === false) {
          wx.showModal({
            title: '需要麦克风', content: '跟读打分要用到麦克风，去设置里打开吧？', confirmText: '去设置',
            success: function (m) {
              if (!m.confirm) return resolve(false);
              wx.openSetting({ success: function (r) { resolve(!!(r.authSetting && r.authSetting['scope.record'])); }, fail: function () { resolve(false); } });
            },
            fail: function () { resolve(false); }
          });
          return;
        }
        wx.authorize({ scope: 'scope.record', success: function () { resolve(true); }, fail: function () { resolve(false); } });
      },
      fail: function () { resolve(false); }
    });
  });
}

// 返回 Promise<{mode, text, err, fatal}>；mode 'none' 表示不能识别，直接自评
function listen(target) {
  return new Promise(function (resolve) {
    if (!canListen() || !manager()) return resolve({ mode: 'none' });
    ensureRecordAuth().then(function (ok) {
      if (!ok) { broken = true; return resolve({ mode: 'sr', text: '', err: 'not-allowed', fatal: true }); }
      var fin = false, guard = null;
      var duration = Math.min(60000, 4000 + String(target).length * 120);
      var end = function (o) {
        if (fin) return; fin = true; handler = null; clearTimeout(guard);
        if (o.fatal) broken = true;
        resolve(o);
      };
      handler = {
        stop: function (res) { errCount = 0; end({ mode: 'sr', text: (res && res.result) || '' }); },
        error: function (res) { errCount++; end({ mode: 'sr', text: '', err: (res && (res.msg || res.retcode)) || 'error', fatal: errCount >= 3 }); }
      };
      try { mgr.start({ lang: 'en_US', duration: duration }); }
      catch (e) { end({ mode: 'sr', text: '', err: 'start', fatal: true }); return; }
      guard = setTimeout(function () {
        try { mgr.stop(); } catch (e) {}
        setTimeout(function () { end({ mode: 'sr', text: '' }); }, 2000);
      }, duration + 3000);
    });
  });
}
function stopListen() { if (handler && mgr) { try { mgr.stop(); } catch (e) {} } }

// 轻量触感反馈（代替网页版的音效）
function buzz(kind) {
  try {
    var app = getApp();
    if (app && app.globalData && app.globalData.buzzOn === false) return;
    if (kind === 'win' || kind === 'no') wx.vibrateShort({ type: kind === 'win' ? 'medium' : 'heavy' });
    else wx.vibrateShort({ type: 'light' });
  } catch (e) {}
}

module.exports = {
  hasTTS: hasTTS, canListen: canListen, speak: speak, stopAudio: stopAudio,
  listen: listen, stopListen: stopListen, buzz: buzz
};
