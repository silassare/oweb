#!/usr/bin/env nodejs
/**
 * O'Web v1.0.0
 *
 * Emile Silas SARE (emile.silas@gmail.com)
 */

let bundler = require("./bundler");

let argExists = function (name) {
	return ~process.argv.indexOf(name);
};

let getArg = function (name) {
	let argv = process.argv;
	let pos  = argv.indexOf(name);

	if (pos !== -1) {
		return argv[pos + 1];
	}

	return undefined;
};

let printUsage = function (err_message) {
	console.log(
		`
O'Web is a framework for web applications that use APIs built with the OZone framework.
`
	);

	if (err_message) {
		console.error(err_message);
	}

	process.exit(0);
};

if (argExists("-h") || argExists("--help")) {
	return printUsage();
}

let OWebCli = {
	getArgs: function () {
		return {
			"source_dir": getArg("--source"),
			"dest_dir"  : getArg("--dest-dir") || process.cwd(),
			"web_root"  : getArg("--web-root")
		};
	}
};

OWebCli.OWEB_VERSION = "1.0.0";

bundler(OWebCli);
