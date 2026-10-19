/* 吉祥物「糖豆」：一只圆滚滚的小熊软糖，mood 控制表情 */
(function (root) {
  var INK = '#4a2c45';
  function eyes(m) {
    var L = 74, R = 126, Y = 104;
    if (m === 'cheer') return '<path d="M62 106 Q74 92 86 106" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M114 106 Q126 92 138 106" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/>';
    if (m === 'sleep') return '<path d="M64 106 Q74 112 84 106" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M116 106 Q126 112 136 106" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/><text x="150" y="58" font-size="26" font-weight="700" fill="#8a6fd1" font-family="sans-serif">z</text><text x="166" y="40" font-size="18" font-weight="700" fill="#8a6fd1" font-family="sans-serif">z</text>';
    if (m === 'love') {
      var h = function (x) { return '<path transform="translate(' + (x - 12) + ',' + (Y - 12) + ')" d="M12 22 C2 14 0 8 4 4 C8 0 12 3 12 6 C12 3 16 0 20 4 C24 8 22 14 12 22Z" fill="#ff3d7f" stroke="' + INK + '" stroke-width="2.5"/>'; };
      return h(L) + h(R);
    }
    var ry = m === 'wow' ? 16 : 13, rx = m === 'wow' ? 12 : 10, dy = m === 'think' ? -4 : 0, dx = m === 'think' ? 4 : 0;
    var e = function (x) {
      return '<ellipse cx="' + x + '" cy="' + Y + '" rx="' + rx + '" ry="' + ry + '" fill="#3a2238"/>' +
        '<circle cx="' + (x - 3 + dx) + '" cy="' + (Y - 5 + dy) + '" r="' + (m === 'wow' ? 5.5 : 4.5) + '" fill="#fff"/>' +
        '<circle cx="' + (x + 4 + dx) + '" cy="' + (Y + 5 + dy) + '" r="2" fill="#fff"/>';
    };
    return e(L) + e(R);
  }
  function mouth(m) {
    if (m === 'wow') return '<ellipse cx="100" cy="130" rx="9" ry="11" fill="#c2306a" stroke="' + INK + '" stroke-width="4"/>';
    if (m === 'cheer' || m === 'love') return '<path d="M84 122 Q100 146 116 122 Z" fill="#c2306a" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M92 132 Q100 140 108 132" fill="#ff8fb3"/>';
    if (m === 'think') return '<path d="M92 128 Q100 124 108 128" stroke="' + INK + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
    if (m === 'sleep') return '<ellipse cx="100" cy="128" rx="5" ry="4" fill="#c2306a"/>';
    return '<path d="M88 122 Q100 136 112 122" stroke="' + INK + '" stroke-width="4.5" fill="#c2306a" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function arms(m) {
    if (m === 'cheer') return '<ellipse cx="34" cy="80" rx="12" ry="20" transform="rotate(-30 34 80)" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/><ellipse cx="166" cy="80" rx="12" ry="20" transform="rotate(30 166 80)" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/>';
    if (m === 'think') return '<ellipse cx="40" cy="138" rx="12" ry="18" transform="rotate(20 40 138)" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/><ellipse cx="146" cy="140" rx="11" ry="16" transform="rotate(-50 146 140)" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/>';
    return '<ellipse cx="36" cy="132" rx="12" ry="18" transform="rotate(25 36 132)" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/><ellipse cx="164" cy="132" rx="12" ry="18" transform="rotate(-25 164 132)" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/>';
  }
  function extra(m) {
    if (m === 'think') return '<text x="150" y="62" font-size="34" font-weight="800" fill="#ffa63d" stroke="' + INK + '" stroke-width="2" font-family="sans-serif">?</text>';
    if (m === 'wow') return '<path d="M160 40 l4 10 10 2 -8 7 2 10 -8 -5 -8 5 2 -10 -8 -7 10 -2z" fill="#ffd23f" stroke="' + INK + '" stroke-width="2.5"/>';
    if (m === 'love') return '<path transform="translate(150 30) scale(.9)" d="M12 22 C2 14 0 8 4 4 C8 0 12 3 12 6 C12 3 16 0 20 4 C24 8 22 14 12 22Z" fill="#ff7aa8" stroke="' + INK + '" stroke-width="2.5"/>';
    return '';
  }
  var uid = 0, gid = 'tdg';
  function mascot(m, size) {
    m = m || 'happy'; size = size || 120;
    gid = 'tdg' + (++uid);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + size + '" height="' + size + '">' +
      '<defs><radialGradient id="' + gid + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffe3ee"/><stop offset="1" stop-color="#ff9cc4"/></radialGradient></defs>' +
      '<ellipse cx="100" cy="186" rx="56" ry="8" fill="#000" opacity=".12"/>' +
      '<circle cx="52" cy="60" r="19" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/><circle cx="52" cy="60" r="9" fill="#ff7aa8"/>' +
      '<circle cx="148" cy="60" r="19" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/><circle cx="148" cy="60" r="9" fill="#ff7aa8"/>' +
      arms(m) +
      '<path d="M100 44 C150 44 172 80 172 116 C172 158 140 180 100 180 C60 180 28 158 28 116 C28 80 50 44 100 44Z" fill="url(#' + gid + ')" stroke="' + INK + '" stroke-width="5"/>' +
      '<ellipse cx="100" cy="150" rx="38" ry="22" fill="#fff4f8" opacity=".9"/>' +
      '<path d="M98 46 Q92 26 104 18" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M104 22 Q124 12 128 28 Q112 34 104 22Z" fill="#6fd68b" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<ellipse cx="78" cy="68" rx="14" ry="7" fill="#fff" opacity=".55" transform="rotate(-25 78 68)"/>' +
      eyes(m) +
      '<ellipse cx="58" cy="124" rx="12" ry="7" fill="#ff5c93" opacity=".45"/><ellipse cx="142" cy="124" rx="12" ry="7" fill="#ff5c93" opacity=".45"/>' +
      mouth(m) + extra(m) + '</svg>';
  }
  if (typeof module !== 'undefined') module.exports = mascot; else root.mascot = mascot;
})(this);
