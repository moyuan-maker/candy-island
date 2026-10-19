// canvas type="2d" 绘图：打卡图 + 封面大片 SHE SPEAKS
function loadImg(canvas, src) {
  return new Promise(function (resolve) {
    if (!src) return resolve(null);
    var img = canvas.createImage();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = src;
  });
}
function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
var FONT = '"PingFang SC","Helvetica Neue","Microsoft YaHei",sans-serif';
function font(c, weight, size, text, maxW) {
  do { c.font = weight + ' ' + size + 'px ' + FONT; if (!text || c.measureText(text).width <= maxW) break; size -= 4; } while (size > 18);
}

// 打卡图 750x1000
function drawShare(canvas, o) {
  var c = canvas.getContext('2d'), W = 750, H = 1000;
  canvas.width = W; canvas.height = H;
  var g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#ffc2dc'); g.addColorStop(0.55, '#ffe6d1'); g.addColorStop(1, '#dff3ff');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,255,255,0.6)';
  [[120, 140, 60], [640, 220, 80], [90, 820, 70], [680, 900, 50]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], p[2], 0, 7); c.fill(); });
  return loadImg(canvas, '/images/mascot-cheer.png').then(function (m) {
    if (m) c.drawImage(m, W / 2 - 150, 120, 300, 300);
    c.textAlign = 'center'; c.fillStyle = '#4a2c45';
    font(c, 'bold', 60, '口语糖果岛 · 第 ' + o.id + ' 关', W - 80); c.fillText('口语糖果岛 · 第 ' + o.id + ' 关', W / 2, 500);
    c.font = 'bold 110px ' + FONT; c.fillStyle = '#ffb800';
    var s = ''; for (var i = 0; i < 3; i++) s += i < o.stars ? '★' : '☆';
    c.fillText(s, W / 2, 640);
    c.fillStyle = '#4a2c45'; c.font = 'bold 40px ' + FONT; c.fillText(o.icon + ' ' + o.stage, W / 2, 720);
    c.font = '34px ' + FONT; c.fillText('连续打卡 ' + o.streak + ' 天 · 已通关 ' + o.done + '/30', W / 2, 790);
    rr(c, 70, 840, W - 140, 100, 30); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#4a2c45'; c.stroke();
    c.fillStyle = '#e0558f'; c.font = 'bold 36px ' + FONT; c.fillText('每天 10 分钟，30 天后开口说英语', W / 2, 903);
  });
}

// 封面大片 900x1200；o: { name, photo(本地路径或 null), real, stars, speaks }
function drawCover(canvas, o) {
  var c = canvas.getContext('2d'), W = 900, H = 1200;
  canvas.width = W; canvas.height = H;
  return loadImg(canvas, o.photo || '/images/mascot-love.png').then(function (img) {
    c.clearRect(0, 0, W, H);
    if (o.photo && img) {
      var s = Math.max(W / img.width, H / img.height);
      c.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    } else {
      var g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#ffb3d1'); g.addColorStop(0.5, '#ffd9c2'); g.addColorStop(1, '#c9b8ff');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (img) c.drawImage(img, W / 2 - 280, 300, 560, 560);
    }
    var sh = c.createLinearGradient(0, H * 0.45, 0, H);
    sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.66)');
    c.fillStyle = sh; c.fillRect(0, 0, W, H);
    var top = c.createLinearGradient(0, 0, 0, 260);
    top.addColorStop(0, 'rgba(0,0,0,0.4)'); top.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = top; c.fillRect(0, 0, W, 260);
    c.fillStyle = '#fff'; c.textAlign = 'center';
    font(c, 'bold', 150, 'SHE SPEAKS', W - 60); c.fillText('SHE SPEAKS', W / 2, 160);
    c.font = 'bold 28px ' + FONT; c.fillText('THE MAIN CHARACTER ISSUE  ·  NO.30', W / 2, 210);
    c.textAlign = 'left'; c.font = 'bold 34px ' + FONT;
    [['本期封面人物', 300], ['200 句博主同款口语', 360], ['5 座城市护照印章', 410]].forEach(function (t, i) { c.fillStyle = i ? '#fff' : '#ffd54f'; c.fillText(t[0], 50, t[1]); });
    c.textAlign = 'center'; c.fillStyle = '#ffd54f';
    font(c, 'bold', 120, o.name, W - 80); c.fillText(o.name, W / 2, H - 250);
    c.fillStyle = '#fff'; c.font = 'bold 48px ' + FONT; c.fillText('30 天，我开口说英语了', W / 2, H - 170);
    var line = o.real ? (o.stars + ' 颗星 · ' + o.speaks + ' 次开口 · 第一条英文 vlog 已录制') : '这里会是你的照片和名字';
    font(c, 'normal', 30, line, W - 60); c.fillText(line, W / 2, H - 110);
    c.font = 'bold 24px ' + FONT; c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillText('CANDY ISLAND ENGLISH', W / 2, H - 50);
  });
}

// 取页面里的 canvas 节点
function getCanvas(comp, sel) {
  return new Promise(function (resolve) {
    wx.createSelectorQuery().in(comp).select(sel).fields({ node: true, size: true }).exec(function (res) {
      resolve(res && res[0] && res[0].node ? res[0].node : null);
    });
  });
}

// 导出并保存到相册
function saveCanvas(canvas) {
  if (!canvas) return;
  wx.showLoading({ title: '生成中…' });
  wx.canvasToTempFilePath({
    canvas: canvas, fileType: 'png',
    success: function (r) {
      wx.saveImageToPhotosAlbum({
        filePath: r.tempFilePath,
        success: function () { wx.hideLoading(); wx.showToast({ title: '已保存到相册 ✨', icon: 'none' }); },
        fail: function (err) {
          wx.hideLoading();
          if (err && /auth|deny/i.test(err.errMsg || '')) {
            wx.showModal({ title: '需要相册权限', content: '去设置里允许「保存到相册」吧', confirmText: '去设置', success: function (m) { if (m.confirm) wx.openSetting(); } });
          } else if (!/cancel/i.test((err && err.errMsg) || '')) {
            wx.previewImage({ urls: [r.tempFilePath] }); // 保存失败就打开大图，长按也能保存
          }
        }
      });
    },
    fail: function () { wx.hideLoading(); wx.showToast({ title: '生成失败，再试一次', icon: 'none' }); }
  });
}

module.exports = { drawShare: drawShare, drawCover: drawCover, getCanvas: getCanvas, saveCanvas: saveCanvas };
