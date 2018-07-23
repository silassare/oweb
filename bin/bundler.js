/**
 * O'Web v1.0.0
 *
 * Emile Silas SARE (emile.silas@gmail.com)
 */

const fs   = require("fs"),
      path = require("path"),
      otpl = require("otpl-js");

let cleanFileContent = function(content) {
	return content.toString()
	              .replace(/"/g, "\\\"")
	              .replace(/\t/g, "\\t")
	              .replace(/\n/g, "\\n")
	              .replace(/\r/g, "\\r");
};

let getWebSrc = function(root, src) {
	return src.replace(root, "")
	          .replace(/\\/g, "/").replace(/^\//, "");
};

// walk into directory and search for file with given extension
// make a bundle as output
let dirTemplateBundle = function(dir, web_root, extensions, to) {
	let tpl_count = 0,
	    list      = fs.readdirSync(dir),
	    file_reg  = new RegExp("(" + extensions.join("|") + ")$");

	list.forEach(function(name) {
		let src = path.resolve(dir, name);

		if (fs.lstatSync(src).isDirectory()) {
			tpl_count += dirTemplateBundle(src, web_root, extensions, to);
		} else if (fs.lstatSync(src).isFile() && file_reg.test(src)) {
			let src_web = getWebSrc(web_root, src);

			to[src_web] = cleanFileContent(fs.readFileSync(src));
			tpl_count++;
		}
	});

	return tpl_count;
};

module.exports = function(cli) {

	let {source_dir, web_root, dest_dir, is_ts} = cli.getArgs();
	const extensions                            = [".otpl", ".txt", ".html"];
	if (!fs.existsSync(source_dir) || !fs.lstatSync(source_dir).isDirectory()) {
		throw new Error("please set a valid source directory");
	}

	if (!fs.existsSync(dest_dir) || !fs.lstatSync(dest_dir).isDirectory()) {
		throw new Error("please set a valid destination directory");
	}

	if (!fs.existsSync(web_root) || !fs.lstatSync(web_root).isDirectory()) {
		throw new Error("please set a valid web_root directory");
	}

	source_dir = path.resolve(source_dir);
	dest_dir   = path.resolve(dest_dir);
	web_root   = path.resolve(web_root);

	const bundle_name = `./oweb.templates.${is_ts ? "ts" : "js"}`,
	      output_tpl  = fs.readFileSync(__dirname +
		      `/../assets/templates.bundle.${is_ts ? "ts" : "js"}.otpl`);

	let bundle_files    = {},//map file path to file content
	    templates_count = dirTemplateBundle(source_dir, web_root,
		    extensions, bundle_files);

	if (templates_count) {
		let o      = new otpl;
		let result = o.parse(output_tpl).runWith({
			"files"       : bundle_files,
			"oweb_version": cli.OWEB_VERSION,
			"bundle_date" : (new Date).toGMTString()
		});

		fs.writeFileSync(path.resolve(dest_dir, bundle_name), result);
		console.log("oweb: %d template(s) bundled.", templates_count);
	} else {
		console.log("oweb: there is no template to bundle.");
	}
};