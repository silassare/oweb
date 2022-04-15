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
    resolve(root, path) {
        root = this.normalize(root);
        path = this.normalize(path);
        if (this.isRelative(path)) {
            let fullPath;
            if (path[0] === '/' || /^[\w]+:/.test(path)) {
                // path start form the root
                // linux - unix	-> /
                // windows		-> D:
                fullPath = path;
            }
            else {
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
    job(path) {
        const _in = path.split(this.DS);
        const out = [];
        // preserve linux root first char '/' like in: /root/path/to/
        if (path[0] === this.DS) {
            out.push('');
        }
        for (let i = 0; i < _in.length; i++) {
            const part = _in[i];
            // ignore part that have no value
            if (!part.length || part === '.')
                continue;
            if (part !== '..') {
                // cool we found a new part
                out.push(part);
            }
            else if (out.length > 0) {
                // going back up? sure
                out.pop();
            }
            else {
                // now here we don't like
                throw new Error('[PathResolver] climbing above root is dangerous: ' + path);
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
    normalize(path) {
        return path.replace(/\\/g, '/');
    },
    /**
     * Checks if a path is a relative path.
     * @param path
     */
    isRelative(path) {
        return (/^\.{1,2}[/\\]?/.test(path) ||
            /[/\\]\.{1,2}[/\\]/.test(path) ||
            /[/\\]\.{1,2}$/.test(path) ||
            /^[a-zA-Z0-9_.][^:]*$/.test(path));
    },
};
export default PathResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhdGhSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFlBQVksR0FBRztJQUNwQjs7T0FFRztJQUNILEVBQUUsRUFBRSxHQUFHO0lBRVA7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFCLElBQUksUUFBUSxDQUFDO1lBRWIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVDLDJCQUEyQjtnQkFDM0Isb0JBQW9CO2dCQUNwQixpQkFBaUI7Z0JBRWpCLFFBQVEsR0FBRyxJQUFJLENBQUM7YUFDaEI7aUJBQU07Z0JBQ04sUUFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQzthQUNqQztZQUVELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNwRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxHQUFHLENBQUMsSUFBWTtRQUNmLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUVmLDZEQUE2RDtRQUM3RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDYjtRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixpQ0FBaUM7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLEdBQUc7Z0JBQUUsU0FBUztZQUUzQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLDJCQUEyQjtnQkFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNmO2lCQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzFCLHNCQUFzQjtnQkFDdEIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1Y7aUJBQU07Z0JBQ04seUJBQXlCO2dCQUN6QixNQUFNLElBQUksS0FBSyxDQUNkLG1EQUFtRCxHQUFHLElBQUksQ0FDMUQsQ0FBQzthQUNGO1NBQ0Q7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDZjtRQUVELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNmO1FBRUQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxJQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILFVBQVUsQ0FBQyxJQUFZO1FBQ3RCLE9BQU8sQ0FDTixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzNCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDOUIsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDMUIsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNqQyxDQUFDO0lBQ0gsQ0FBQztDQUNELENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBhdGhSZXNvbHZlciA9IHtcblx0LyoqXG5cdCAqIFRoZSBkaXJlY3Rvcnkgc2VwYXJhdG9yLlxuXHQgKi9cblx0RFM6ICcvJyxcblxuXHQvKipcblx0ICogUmVzb2x2ZSBhIGdpdmVuIHBhdGggdG8gdGhlIHRoZSBnaXZlbiByb290LlxuXHQgKlxuXHQgKiBAcGFyYW0gcm9vdFxuXHQgKiBAcGFyYW0gcGF0aFxuXHQgKi9cblx0cmVzb2x2ZShyb290OiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0cm9vdCA9IHRoaXMubm9ybWFsaXplKHJvb3QpO1xuXHRcdHBhdGggPSB0aGlzLm5vcm1hbGl6ZShwYXRoKTtcblxuXHRcdGlmICh0aGlzLmlzUmVsYXRpdmUocGF0aCkpIHtcblx0XHRcdGxldCBmdWxsUGF0aDtcblxuXHRcdFx0aWYgKHBhdGhbMF0gPT09ICcvJyB8fCAvXltcXHddKzovLnRlc3QocGF0aCkpIHtcblx0XHRcdFx0Ly8gcGF0aCBzdGFydCBmb3JtIHRoZSByb290XG5cdFx0XHRcdC8vIGxpbnV4IC0gdW5peFx0LT4gL1xuXHRcdFx0XHQvLyB3aW5kb3dzXHRcdC0+IEQ6XG5cblx0XHRcdFx0ZnVsbFBhdGggPSBwYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsbFBhdGggPSByb290ICsgdGhpcy5EUyArIHBhdGg7XG5cdFx0XHR9XG5cblx0XHRcdHBhdGggPSB0aGlzLmpvYihmdWxsUGF0aCkucmVwbGFjZSgvXihodHRwcz8pOlsvXShbXi9dKS8sICckMTovLyQyJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERvIHRoZSBwYXRoIHJlc29sdmluZyBqb2IuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoXG5cdCAqL1xuXHRqb2IocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRjb25zdCBfaW4gPSBwYXRoLnNwbGl0KHRoaXMuRFMpO1xuXHRcdGNvbnN0IG91dCA9IFtdO1xuXG5cdFx0Ly8gcHJlc2VydmUgbGludXggcm9vdCBmaXJzdCBjaGFyICcvJyBsaWtlIGluOiAvcm9vdC9wYXRoL3RvL1xuXHRcdGlmIChwYXRoWzBdID09PSB0aGlzLkRTKSB7XG5cdFx0XHRvdXQucHVzaCgnJyk7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBfaW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHBhcnQgPSBfaW5baV07XG5cdFx0XHQvLyBpZ25vcmUgcGFydCB0aGF0IGhhdmUgbm8gdmFsdWVcblx0XHRcdGlmICghcGFydC5sZW5ndGggfHwgcGFydCA9PT0gJy4nKSBjb250aW51ZTtcblxuXHRcdFx0aWYgKHBhcnQgIT09ICcuLicpIHtcblx0XHRcdFx0Ly8gY29vbCB3ZSBmb3VuZCBhIG5ldyBwYXJ0XG5cdFx0XHRcdG91dC5wdXNoKHBhcnQpO1xuXHRcdFx0fSBlbHNlIGlmIChvdXQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBnb2luZyBiYWNrIHVwPyBzdXJlXG5cdFx0XHRcdG91dC5wb3AoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5vdyBoZXJlIHdlIGRvbid0IGxpa2Vcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdCdbUGF0aFJlc29sdmVyXSBjbGltYmluZyBhYm92ZSByb290IGlzIGRhbmdlcm91czogJyArIHBhdGhcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIW91dC5sZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLkRTO1xuXHRcdH1cblxuXHRcdGlmIChvdXQubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRvdXQucHVzaChudWxsKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0LmpvaW4odGhpcy5EUyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZSBhIGdpdmVuIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoXG5cdCAqL1xuXHRub3JtYWxpemUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gcGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHBhdGggaXMgYSByZWxhdGl2ZSBwYXRoLlxuXHQgKiBAcGFyYW0gcGF0aFxuXHQgKi9cblx0aXNSZWxhdGl2ZShwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0L15cXC57MSwyfVsvXFxcXF0/Ly50ZXN0KHBhdGgpIHx8XG5cdFx0XHQvWy9cXFxcXVxcLnsxLDJ9Wy9cXFxcXS8udGVzdChwYXRoKSB8fFxuXHRcdFx0L1svXFxcXF1cXC57MSwyfSQvLnRlc3QocGF0aCkgfHxcblx0XHRcdC9eW2EtekEtWjAtOV8uXVteOl0qJC8udGVzdChwYXRoKVxuXHRcdCk7XG5cdH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYXRoUmVzb2x2ZXI7XG4iXX0=