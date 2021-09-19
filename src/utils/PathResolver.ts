const PathResolver = {
	/**
	 * The directory separator.
	 */
	DS: '/',

	/**
	 * Resolve a given path to the the given root.
	 *
	 * @param root
	 * @param path
	 */
	resolve(root: string, path: string): string {
		root = this.normalize(root);
		path = this.normalize(path);

		if (this.isRelative(path)) {
			let fullPath;

			if (path[0] === '/' || /^[\w]+:/.test(path)) {
				// path start form the root
				// linux - unix	-> /
				// windows		-> D:

				fullPath = path;
			} else {
				fullPath = root + this.DS + path;
			}

			path = this.job(fullPath).replace(/^(https?):[/]([^/])/, '$1://$2');
		}

		return path;
	},

	/**
	 * Do the path resolving job.
	 *
	 * @param path
	 */
	job(path: string): string {
		const _in = path.split(this.DS);
		const out = [];

		// preserve linux root first char '/' like in: /root/path/to/
		if (path[0] === this.DS) {
			out.push('');
		}

		for (let i = 0; i < _in.length; i++) {
			const part = _in[i];
			// ignore part that have no value
			if (!part.length || part === '.') continue;

			if (part !== '..') {
				// cool we found a new part
				out.push(part);
			} else if (out.length > 0) {
				// going back up? sure
				out.pop();
			} else {
				// now here we don't like
				throw new Error(
					'[PathResolver] climbing above root is dangerous: ' + path
				);
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
	normalize(path: string): string {
		return path.replace(/\\/g, '/');
	},

	/**
	 * Checks if a path is a relative path.
	 * @param path
	 */
	isRelative(path: string): boolean {
		return (
			/^\.{1,2}[/\\]?/.test(path) ||
			/[/\\]\.{1,2}[/\\]/.test(path) ||
			/[/\\]\.{1,2}$/.test(path) ||
			/^[a-zA-Z0-9_.][^:]*$/.test(path)
		);
	},
};

export default PathResolver;
