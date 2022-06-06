var xEncode = require('./xEncode.cjs');

var _PADCHAR = "="
  , _ALPHA = "LVoJPiCN2R8G90yg+hmFHuacZ1OWMnrsSTXkYpUq/3dlbfKwv6xztjI7DeBE45QA"
  , _VERSION = "1.0";
function _getbyte64(s, i) {
  var idx = _ALPHA.indexOf(s.charAt(i));
  if (idx === -1) {
    throw "Cannot decode base64"
  }
  return idx
}
function _setAlpha(s) {
  _ALPHA = s;
}
function _getbyte(s, i) {
  var x = s.charCodeAt(i);
  if (x > 255) {
    throw "INVALID_CHARACTER_ERR: DOM Exception 5"
  }
  return x
}
function _encode(s) {
  if (arguments.length !== 1) {
    throw "SyntaxError: exactly one argument required"
  }
  s = String(s);
  var i, b10, x = [], imax = s.length - s.length % 3;
  if (s.length === 0) {
    return s
  }
  for (i = 0; i < imax; i += 3) {
    b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8) | _getbyte(s, i + 2);
    x.push(_ALPHA.charAt(b10 >> 18));
    x.push(_ALPHA.charAt((b10 >> 12) & 63));
    x.push(_ALPHA.charAt((b10 >> 6) & 63));
    x.push(_ALPHA.charAt(b10 & 63))
  }
  switch (s.length - imax) {
    case 1:
      b10 = _getbyte(s, i) << 16;
      x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 63) + _PADCHAR + _PADCHAR);
      break;
    case 2:
      b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8);
      x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 63) + _ALPHA.charAt((b10 >> 6) & 63) + _PADCHAR);
      break
  }
  return x.join("")
}

function info(d, k) {
  return "{SRBX1}" + _encode(xEncode(JSON.stringify(d), k));
}

module.exports = info;
