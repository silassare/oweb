const fs     = require("fs"),
      path   = require("path"),
      mkdest = require("../mkdest"),
      root   = path.resolve(process.cwd(), "./src");

module.exports = {
	run: function(cli) {

		const name = cli.getArg("name");

		if (!name || !name.length) {
			console.log(
				`invalid widget name, ex: my-widget or sub/dir/my-widget`);
			return;
		}

		const componentName       = name.split("/").pop(),
		      fileName            = name.replace(/-/g, "."),
		      tsBaseComponentFile = path.resolve(root, "./components/base.ts"),
		      tsFile              = path.resolve(root,
			      "./components/" + fileName + ".ts"),
		      htmlFile            = path.resolve(root,
			      "./templates/" + fileName + ".html");

		if (fs.existsSync(tsFile)) {
			console.warn(`exists: ${tsFile}`);
			return;
		}
		if (fs.existsSync(htmlFile)) {
			console.warn(`exists: ${htmlFile}`);
			return;
		}

		const tsToRootRelative       = path.relative(
			path.dirname(tsFile),
			root) || ".";
		const tsToComponentsRelative = path.relative(
			path.dirname(tsFile),
			path.resolve(root, "./components/")) || ".";
		const tsContent              = `import BaseComponent from "${tsToComponentsRelative}/base";
import {templateLoad} from "${tsToRootRelative }/oweb.templates";

export default BaseComponent.extend( {
	name    : "${componentName}",
	template: templateLoad("${fileName}.html"),
	data    : function () {
		return {}
	},
});`,
		      htmlContent            = `<div>component: ${componentName}</div>`,
		      tsBaseComponentContent = `import {OWebVueMixin} from "oweb";
import app from "../App";

const BaseComponent = OWebVueMixin(app).extend({
	methods: {}
});

export default BaseComponent;`;

		Promise.all([mkdest(tsFile), mkdest(htmlFile)])
		       .then(function() {

			       if (!fs.existsSync(tsBaseComponentFile)) {
				       fs.writeFileSync(tsBaseComponentFile,
					       tsBaseComponentContent);
			       }
			       fs.writeFileSync(tsFile, tsContent);
			       fs.writeFileSync(htmlFile, htmlContent);

			       console.log(`component added: ${componentName}`);
		       });
	}
};
