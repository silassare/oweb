const fs     = require("fs"),
      path   = require("path"),
      mkdest = require("../mkdest"),
      root   = path.resolve(process.cwd(), "./src");

module.exports = {
	run: function(cli) {

		const name = cli.getArg("name");

		if (!name || !name.length) {
			console.log(
				`invalid page name, ex: my-page or sub/dir/my-page`);
			return;
		}

		const parts            = name.split("/"),
		      componentName    = parts.pop(),
		      subDir           = parts.length ? parts.join("/") + "/" : "",
		      componentNameDot = componentName.replace(/-/g, "."),
		      pageClassName    = componentName.replace(/-([a-z0-9])/g,
			      function(a, c) {
				      return c.toUpperCase();
			      }).replace(/^([a-z0-9])/g,
			      function(a, c) {
				      return c.toUpperCase();
			      }),
		      tsFile           = path.resolve(root,
			      "./components/" + subDir + componentNameDot + ".ts"),
		      tsPageClassFile  = path.resolve(root,
			      "./pages/" + subDir + pageClassName + ".ts"),
		      htmlFile         = path.resolve(root,
			      "./templates/" + subDir + componentNameDot + ".html");

		if (fs.existsSync(tsFile)) {
			console.warn(`exists: ${tsFile}`);
			return;
		}
		if (fs.existsSync(htmlFile)) {
			console.warn(`exists: ${htmlFile}`);
			return;
		}

		if (fs.existsSync(tsPageClassFile)) {
			console.warn(`exists: ${tsPageClassFile}`);
			return;
		}

		const tsToRootRelative       = path.relative(path.dirname(tsFile),
			root) || ".";
		const tsToComponentsRelative = path.relative(
			path.dirname(tsPageClassFile),
			path.resolve(root, "./components/")) || ".";
		const tsPageClassContent     = `import {OWebPageBase, tPageRoute} from "oweb";
import {templateLoad} from "${tsToRootRelative }/oweb.templates";
import BaseComponent from "${tsToComponentsRelative}/base";

export default class ${pageClassName} extends OWebPageBase {
	getName() {
		return "${pageClassName}"
	}

	getRoutes(): tPageRoute[] {
		return [{
			title: "",
			path : "/"
		}]
	}

	component() {
		return BaseComponent.extend({
			name: "${componentName}",
			template: templateLoad("${subDir + componentNameDot}.html"),
			data: function () {
				return {}
			}
		});
	}
}`;
		const htmlContent            = `<div>page component: ${componentName}</div>`;

		Promise.all([mkdest(htmlFile), mkdest(tsPageClassFile)])
		       .then(function() {
			       fs.writeFileSync(htmlFile, htmlContent);
			       fs.writeFileSync(tsPageClassFile, tsPageClassContent);

			       console.log(`page added: ${componentName}`);
		       });
	}
};