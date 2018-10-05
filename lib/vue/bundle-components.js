const fs     = require("fs"),
      path   = require("path"),
      mkdest = require("../mkdest"),
      OTpl   = require("otpl-js"),
      root   = path.resolve(process.cwd(), "./src");

module.exports = {
	run: function(cli) {

		const componentsDir      = path.resolve(root, "components"),
		      destFile           = path.resolve(root, "./oweb.components.ts"),
		      components         = [],
		      extReg             = /\.ts$/,
		      template           = cli.getAssetContent(
			      "bundle.components.otpl"),
		      registerComponents = function(dir, root) {
			      let list = fs.readdirSync(dir);
			      list.forEach(function(fileName) {
				      let src = path.resolve(dir, fileName);
				      if (extReg.test(fileName) && fs.lstatSync(src).isFile()) {
					      let baseFileName = fileName.replace(extReg, "");
					      if (baseFileName !== "base") {

						      components.push({
							      "dir"          : path.relative(root,
								      path.dirname(src)),
							      "class"        : baseFileName.replace(
								      /\.([a-z])/g,
								      function(a, c) {
									      return c.toUpperCase();
								      }).replace(/^([a-z])/g,
								      function(a, c) {
									      return c.toUpperCase();
								      }),
							      "baseFileName" : baseFileName,
							      "componentName": baseFileName.replace(/\./g,
								      "-")
						      });
					      }
				      } else if (fs.lstatSync(src).isDirectory()) {
					      registerComponents(src, root);
				      }
			      });
		      };

		mkdest(componentsDir)
			.then(function() {
				registerComponents(componentsDir, root);

				let o       = new OTpl;
				let content = o.parse(template).runWith({
					components,
					"oweb_version": cli.OWEB_VERSION,
					"bundle_date" : (new Date).toGMTString()
				});

				fs.writeFileSync(destFile, content);

				console.log(`oweb: ${components.length} component(s) registered.`);
			});
	}
};