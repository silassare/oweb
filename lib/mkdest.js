const path    = require("path"),
      makeDir = require("make-dir");

module.exports = function(dest) {
	let dir = path.dirname(dest);
	return makeDir(dir);
};