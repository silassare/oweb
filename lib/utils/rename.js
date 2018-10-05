const fs   = require("fs"),
      path = require("path");

// usage: oweb rename --src=./src/components --format=([A-Za-z])([A-Z]) --replace=$1.$2
module.exports = {
	run: function(cli) {
		let source   = cli.getArg("src"),
		    _format  = cli.getArg("format"),
		    _replace = cli.getArg("replace"),
		    list     = fs.readdirSync(source);

		_format = new RegExp(_format, "g");

		list.forEach(function(filename) {
			let src  = path.resolve(source, filename),
			    dest = path.resolve(source,
				filename.replace(_format, _replace).toLowerCase());

			if (fs.lstatSync(src).isFile()) {
				fs.renameSync(src, dest);
			}
		});
	}
};