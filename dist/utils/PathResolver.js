/*
 * Copyright (c) Emile Silas Sare <emile.silas@gmail.com>
 *
 * This file is part of Otpl.
 */
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
    resolve: function (root_, path) {
        root_ = this.normalize(root_);
        path = this.normalize(path);
        if (this.isRelative(path)) {
            let full_path;
            if (path[0] === "/" || /^[\w]+:/.test(path)) {
                // path start form the root
                // linux - unix	-> /
                // windows		-> D:
                full_path = path;
            }
            else {
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
    job: function (path) {
        let _in = path.split(this.DS);
        let out = [];
        // preserve linux root first char '/' like in: /root/path/to/
        if (path[0] === this.DS) {
            out.push("");
        }
        for (let i = 0; i < _in.length; i++) {
            let part = _in[i];
            // ignore part that have no value
            if (!part.length || part === ".")
                continue;
            if (part !== "..") {
                // cool we found a new part
                out.push(part);
            }
            else if (out.length > 0) {
                // going back up? sure
                out.pop();
            }
            else {
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
    normalize: function (path) {
        return path.replace(/\\/g, "/");
    },
    /**
     * Check if a path is a relative path.
     * @param path
     */
    isRelative: function (path) {
        return /^\.{1,2}[/\\]?/.test(path)
            || /[/\\]\.{1,2}[/\\]/.test(path)
            || /[/\\]\.{1,2}$/.test(path)
            || /^[a-zA-Z0-9_.][^:]*$/.test(path);
    }
};
export default PathResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhdGhSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsTUFBTSxZQUFZLEdBQUc7SUFDcEI7O09BRUc7SUFDSCxFQUFFLEVBQUUsR0FBRztJQUVQOzs7OztPQUtHO0lBQ0gsT0FBTyxFQUFFLFVBQVUsS0FBYSxFQUFFLElBQVk7UUFDN0MsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsSUFBSSxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0IsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFCLElBQUksU0FBUyxDQUFDO1lBRWQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVDLDJCQUEyQjtnQkFDM0Isb0JBQW9CO2dCQUNwQixpQkFBaUI7Z0JBRWpCLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDakI7aUJBQU07Z0JBQ04sU0FBUyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQzthQUNuQztZQUVELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNyRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxHQUFHLEVBQUUsVUFBVSxJQUFZO1FBQzFCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUViLDZEQUE2RDtRQUM3RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDYjtRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixpQ0FBaUM7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLEdBQUc7Z0JBQUUsU0FBUztZQUUzQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLDJCQUEyQjtnQkFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUVmO2lCQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzFCLHNCQUFzQjtnQkFDdEIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1Y7aUJBQU07Z0JBQ04seUJBQXlCO2dCQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxHQUFHLElBQUksQ0FBQyxDQUFDO2FBQzVFO1NBQ0Q7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDZjtRQUVELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNmO1FBRUQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsRUFBRSxVQUFVLElBQVk7UUFDaEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVSxFQUFFLFVBQVUsSUFBUztRQUM5QixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7ZUFDM0IsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztlQUM5QixlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztlQUMxQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNELENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgKGMpIEVtaWxlIFNpbGFzIFNhcmUgPGVtaWxlLnNpbGFzQGdtYWlsLmNvbT5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBPdHBsLlxuICovXG5cbmNvbnN0IFBhdGhSZXNvbHZlciA9IHtcblx0LyoqXG5cdCAqIFRoZSBkaXJlY3Rvcnkgc2VwYXJhdG9yLlxuXHQgKi9cblx0RFM6IFwiL1wiLFxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlIGEgZ2l2ZW4gcGF0aCB0byB0aGUgdGhlIGdpdmVuIHJvb3QuXG5cdCAqXG5cdCAqIEBwYXJhbSByb290X1xuXHQgKiBAcGFyYW0gcGF0aFxuXHQgKi9cblx0cmVzb2x2ZTogZnVuY3Rpb24gKHJvb3RfOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0cm9vdF8gPSB0aGlzLm5vcm1hbGl6ZShyb290Xyk7XG5cdFx0cGF0aCAgPSB0aGlzLm5vcm1hbGl6ZShwYXRoKTtcblxuXHRcdGlmICh0aGlzLmlzUmVsYXRpdmUocGF0aCkpIHtcblx0XHRcdGxldCBmdWxsX3BhdGg7XG5cblx0XHRcdGlmIChwYXRoWzBdID09PSBcIi9cIiB8fCAvXltcXHddKzovLnRlc3QocGF0aCkpIHtcblx0XHRcdFx0Ly8gcGF0aCBzdGFydCBmb3JtIHRoZSByb290XG5cdFx0XHRcdC8vIGxpbnV4IC0gdW5peFx0LT4gL1xuXHRcdFx0XHQvLyB3aW5kb3dzXHRcdC0+IEQ6XG5cblx0XHRcdFx0ZnVsbF9wYXRoID0gcGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGxfcGF0aCA9IHJvb3RfICsgdGhpcy5EUyArIHBhdGg7XG5cdFx0XHR9XG5cblx0XHRcdHBhdGggPSB0aGlzLmpvYihmdWxsX3BhdGgpLnJlcGxhY2UoL14oaHR0cHM/KTpbL10oW14vXSkvLCBcIiQxOi8vJDJcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERvIHRoZSBwYXRoIHJlc29sdmluZyBqb2IuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoXG5cdCAqL1xuXHRqb2I6IGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGxldCBfaW4gPSBwYXRoLnNwbGl0KHRoaXMuRFMpO1xuXHRcdGxldCBvdXQgPSBbXTtcblxuXHRcdC8vIHByZXNlcnZlIGxpbnV4IHJvb3QgZmlyc3QgY2hhciAnLycgbGlrZSBpbjogL3Jvb3QvcGF0aC90by9cblx0XHRpZiAocGF0aFswXSA9PT0gdGhpcy5EUykge1xuXHRcdFx0b3V0LnB1c2goXCJcIik7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBfaW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBwYXJ0ID0gX2luW2ldO1xuXHRcdFx0Ly8gaWdub3JlIHBhcnQgdGhhdCBoYXZlIG5vIHZhbHVlXG5cdFx0XHRpZiAoIXBhcnQubGVuZ3RoIHx8IHBhcnQgPT09IFwiLlwiKSBjb250aW51ZTtcblxuXHRcdFx0aWYgKHBhcnQgIT09IFwiLi5cIikge1xuXHRcdFx0XHQvLyBjb29sIHdlIGZvdW5kIGEgbmV3IHBhcnRcblx0XHRcdFx0b3V0LnB1c2gocGFydCk7XG5cblx0XHRcdH0gZWxzZSBpZiAob3V0Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Ly8gZ29pbmcgYmFjayB1cD8gc3VyZVxuXHRcdFx0XHRvdXQucG9wKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBub3cgaGVyZSB3ZSBkb24ndCBsaWtlXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIltQYXRoUmVzb2x2ZXJdIGNsaW1iaW5nIGFib3ZlIHJvb3QgaXMgZGFuZ2Vyb3VzOiBcIiArIHBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghb3V0Lmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuRFM7XG5cdFx0fVxuXG5cdFx0aWYgKG91dC5sZW5ndGggPT09IDEpIHtcblx0XHRcdG91dC5wdXNoKG51bGwpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXQuam9pbih0aGlzLkRTKTtcblx0fSxcblxuXHQvKipcblx0ICogTm9ybWFsaXplIGEgZ2l2ZW4gcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhcblx0ICovXG5cdG5vcm1hbGl6ZTogZnVuY3Rpb24gKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCBcIi9cIik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIGEgcGF0aCBpcyBhIHJlbGF0aXZlIHBhdGguXG5cdCAqIEBwYXJhbSBwYXRoXG5cdCAqL1xuXHRpc1JlbGF0aXZlOiBmdW5jdGlvbiAocGF0aDogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIC9eXFwuezEsMn1bL1xcXFxdPy8udGVzdChwYXRoKVxuXHRcdFx0ICAgfHwgL1svXFxcXF1cXC57MSwyfVsvXFxcXF0vLnRlc3QocGF0aClcblx0XHRcdCAgIHx8IC9bL1xcXFxdXFwuezEsMn0kLy50ZXN0KHBhdGgpXG5cdFx0XHQgICB8fCAvXlthLXpBLVowLTlfLl1bXjpdKiQvLnRlc3QocGF0aCk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBhdGhSZXNvbHZlcjsiXX0=