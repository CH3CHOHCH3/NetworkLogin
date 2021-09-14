var base64 = require('./base64');
var xEncode = require('./xEncode');

function info(d , k) {
	return "{SRBX1}" + base64(xEncode(JSON.stringify(d), k));
}

module.exports = info;
