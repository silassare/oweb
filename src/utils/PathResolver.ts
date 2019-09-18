const PathResolver = {
	/**
	 * The directory separator.
	 */
	DS: "/",

	/**
	 * Resolve a given path to the the given root.
	 *
	 * @param root_
	 * @param path
	 */
	resolve: function (root_: string, path: string): string {
		root_ = this.normalize(root_);
		path  = this.normalize(path);

		if (this.isRelative(path)) {
			let full_path;

			if (path[0] === "/" || /^[\w]+:/.test(path)) {
				// path start form the root
				// linux - unix	-> /
				// windows		-> D:

				full_path = path;
			} else {
				full_path = root_ + this.DS + path;
			}

			path = this.job(full_path).replace(/^(https?):[/]([^/])/, "$1://$2");
		}

		return path;
	},

	/**
	 * Do the path resolving job.
	 *
	 * @param path
	 */
	job: function (path: string): string {
		let _in = path.split(this.DS);
		let out = [];

		// preserve linux root first char '/' like in: /root/path/to/
		if (path[0] === this.DS) {
			out.push("");
		}

		for (let i = 0; i < _in.length; i++) {
			let part = _in[i];
			// ignore part that have no value
			if (!part.length || part === ".") continue;

			if (part !== "..") {
				// cool we found a new part
				out.push(part);

			} else if (out.length > 0) {
				// going back up? sure
				out.pop();
			} else {
				// now here we don't like
				throw new Error("[PathResolver] climbing above root is dangerous: " + path);
			}
		}

		if (!out.length) {
			return this.DS;
		}

		if (out.length === 1) {
			out.push(null);
		}

		return out.join(this.DS);
	},

	/**
	 * Normalize a given path.
	 *
	 * @param path
	 */
	normalize: function (path: string): string {
		return path.replace(/\\/g, "/");
	},

	/**
	 * Checks if a path is a relative path.
	 * @param path
	 */
	isRelative: function (path: any): boolean {
		return /^\.{1,2}[/\\]?/.test(path)
			   || /[/\\]\.{1,2}[/\\]/.test(path)
			   || /[/\\]\.{1,2}$/.test(path)
			   || /^[a-zA-Z0-9_.][^:]*$/.test(path);
	}
};

export default PathResolver;