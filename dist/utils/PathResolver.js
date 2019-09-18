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
     * Checks if a path is a relative path.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhdGhSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFlBQVksR0FBRztJQUNwQjs7T0FFRztJQUNILEVBQUUsRUFBRSxHQUFHO0lBRVA7Ozs7O09BS0c7SUFDSCxPQUFPLEVBQUUsVUFBVSxLQUFhLEVBQUUsSUFBWTtRQUM3QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUIsSUFBSSxTQUFTLENBQUM7WUFFZCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUMsMkJBQTJCO2dCQUMzQixvQkFBb0I7Z0JBQ3BCLGlCQUFpQjtnQkFFakIsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNqQjtpQkFBTTtnQkFDTixTQUFTLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO2FBQ25DO1lBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEdBQUcsRUFBRSxVQUFVLElBQVk7UUFDMUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBRWIsNkRBQTZEO1FBQzdELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDeEIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNiO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLGlDQUFpQztZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEtBQUssR0FBRztnQkFBRSxTQUFTO1lBRTNDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDbEIsMkJBQTJCO2dCQUMzQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBRWY7aUJBQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDMUIsc0JBQXNCO2dCQUN0QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDVjtpQkFBTTtnQkFDTix5QkFBeUI7Z0JBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELEdBQUcsSUFBSSxDQUFDLENBQUM7YUFDNUU7U0FDRDtRQUVELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUNmO1FBRUQsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2Y7UUFFRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxFQUFFLFVBQVUsSUFBWTtRQUNoQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVLEVBQUUsVUFBVSxJQUFTO1FBQzlCLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztlQUMzQixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2VBQzlCLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2VBQzFCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0QsQ0FBQztBQUVGLGVBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGF0aFJlc29sdmVyID0ge1xuXHQvKipcblx0ICogVGhlIGRpcmVjdG9yeSBzZXBhcmF0b3IuXG5cdCAqL1xuXHREUzogXCIvXCIsXG5cblx0LyoqXG5cdCAqIFJlc29sdmUgYSBnaXZlbiBwYXRoIHRvIHRoZSB0aGUgZ2l2ZW4gcm9vdC5cblx0ICpcblx0ICogQHBhcmFtIHJvb3RfXG5cdCAqIEBwYXJhbSBwYXRoXG5cdCAqL1xuXHRyZXNvbHZlOiBmdW5jdGlvbiAocm9vdF86IHN0cmluZywgcGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyb290XyA9IHRoaXMubm9ybWFsaXplKHJvb3RfKTtcblx0XHRwYXRoICA9IHRoaXMubm9ybWFsaXplKHBhdGgpO1xuXG5cdFx0aWYgKHRoaXMuaXNSZWxhdGl2ZShwYXRoKSkge1xuXHRcdFx0bGV0IGZ1bGxfcGF0aDtcblxuXHRcdFx0aWYgKHBhdGhbMF0gPT09IFwiL1wiIHx8IC9eW1xcd10rOi8udGVzdChwYXRoKSkge1xuXHRcdFx0XHQvLyBwYXRoIHN0YXJ0IGZvcm0gdGhlIHJvb3Rcblx0XHRcdFx0Ly8gbGludXggLSB1bml4XHQtPiAvXG5cdFx0XHRcdC8vIHdpbmRvd3NcdFx0LT4gRDpcblxuXHRcdFx0XHRmdWxsX3BhdGggPSBwYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsbF9wYXRoID0gcm9vdF8gKyB0aGlzLkRTICsgcGF0aDtcblx0XHRcdH1cblxuXHRcdFx0cGF0aCA9IHRoaXMuam9iKGZ1bGxfcGF0aCkucmVwbGFjZSgvXihodHRwcz8pOlsvXShbXi9dKS8sIFwiJDE6Ly8kMlwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogRG8gdGhlIHBhdGggcmVzb2x2aW5nIGpvYi5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhcblx0ICovXG5cdGpvYjogZnVuY3Rpb24gKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0bGV0IF9pbiA9IHBhdGguc3BsaXQodGhpcy5EUyk7XG5cdFx0bGV0IG91dCA9IFtdO1xuXG5cdFx0Ly8gcHJlc2VydmUgbGludXggcm9vdCBmaXJzdCBjaGFyICcvJyBsaWtlIGluOiAvcm9vdC9wYXRoL3RvL1xuXHRcdGlmIChwYXRoWzBdID09PSB0aGlzLkRTKSB7XG5cdFx0XHRvdXQucHVzaChcIlwiKTtcblx0XHR9XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IF9pbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IHBhcnQgPSBfaW5baV07XG5cdFx0XHQvLyBpZ25vcmUgcGFydCB0aGF0IGhhdmUgbm8gdmFsdWVcblx0XHRcdGlmICghcGFydC5sZW5ndGggfHwgcGFydCA9PT0gXCIuXCIpIGNvbnRpbnVlO1xuXG5cdFx0XHRpZiAocGFydCAhPT0gXCIuLlwiKSB7XG5cdFx0XHRcdC8vIGNvb2wgd2UgZm91bmQgYSBuZXcgcGFydFxuXHRcdFx0XHRvdXQucHVzaChwYXJ0KTtcblxuXHRcdFx0fSBlbHNlIGlmIChvdXQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBnb2luZyBiYWNrIHVwPyBzdXJlXG5cdFx0XHRcdG91dC5wb3AoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5vdyBoZXJlIHdlIGRvbid0IGxpa2Vcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiW1BhdGhSZXNvbHZlcl0gY2xpbWJpbmcgYWJvdmUgcm9vdCBpcyBkYW5nZXJvdXM6IFwiICsgcGF0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCFvdXQubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5EUztcblx0XHR9XG5cblx0XHRpZiAob3V0Lmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0b3V0LnB1c2gobnVsbCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dC5qb2luKHRoaXMuRFMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemUgYSBnaXZlbiBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aFxuXHQgKi9cblx0bm9ybWFsaXplOiBmdW5jdGlvbiAocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gcGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgcGF0aCBpcyBhIHJlbGF0aXZlIHBhdGguXG5cdCAqIEBwYXJhbSBwYXRoXG5cdCAqL1xuXHRpc1JlbGF0aXZlOiBmdW5jdGlvbiAocGF0aDogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIC9eXFwuezEsMn1bL1xcXFxdPy8udGVzdChwYXRoKVxuXHRcdFx0ICAgfHwgL1svXFxcXF1cXC57MSwyfVsvXFxcXF0vLnRlc3QocGF0aClcblx0XHRcdCAgIHx8IC9bL1xcXFxdXFwuezEsMn0kLy50ZXN0KHBhdGgpXG5cdFx0XHQgICB8fCAvXlthLXpBLVowLTlfLl1bXjpdKiQvLnRlc3QocGF0aCk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBhdGhSZXNvbHZlcjsiXX0=