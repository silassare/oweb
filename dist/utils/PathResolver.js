const PathResolver = {
    /**
     * The directory separator.
     */
    DS: '/',
    /**
     * Resolve a given path to the the given root.
     *
     * @param root_
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhdGhSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFlBQVksR0FBRztJQUNwQjs7T0FFRztJQUNILEVBQUUsRUFBRSxHQUFHO0lBRVA7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFCLElBQUksUUFBUSxDQUFDO1lBRWIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVDLDJCQUEyQjtnQkFDM0Isb0JBQW9CO2dCQUNwQixpQkFBaUI7Z0JBRWpCLFFBQVEsR0FBRyxJQUFJLENBQUM7YUFDaEI7aUJBQU07Z0JBQ04sUUFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQzthQUNqQztZQUVELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNwRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxHQUFHLENBQUMsSUFBWTtRQUNmLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUVmLDZEQUE2RDtRQUM3RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDYjtRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixpQ0FBaUM7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLEdBQUc7Z0JBQUUsU0FBUztZQUUzQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLDJCQUEyQjtnQkFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNmO2lCQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzFCLHNCQUFzQjtnQkFDdEIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1Y7aUJBQU07Z0JBQ04seUJBQXlCO2dCQUN6QixNQUFNLElBQUksS0FBSyxDQUNkLG1EQUFtRCxHQUFHLElBQUksQ0FDMUQsQ0FBQzthQUNGO1NBQ0Q7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDZjtRQUVELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNmO1FBRUQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxJQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILFVBQVUsQ0FBQyxJQUFTO1FBQ25CLE9BQU8sQ0FDTixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzNCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDOUIsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDMUIsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNqQyxDQUFDO0lBQ0gsQ0FBQztDQUNELENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBhdGhSZXNvbHZlciA9IHtcblx0LyoqXG5cdCAqIFRoZSBkaXJlY3Rvcnkgc2VwYXJhdG9yLlxuXHQgKi9cblx0RFM6ICcvJyxcblxuXHQvKipcblx0ICogUmVzb2x2ZSBhIGdpdmVuIHBhdGggdG8gdGhlIHRoZSBnaXZlbiByb290LlxuXHQgKlxuXHQgKiBAcGFyYW0gcm9vdF9cblx0ICogQHBhcmFtIHBhdGhcblx0ICovXG5cdHJlc29sdmUocm9vdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHJvb3QgPSB0aGlzLm5vcm1hbGl6ZShyb290KTtcblx0XHRwYXRoID0gdGhpcy5ub3JtYWxpemUocGF0aCk7XG5cblx0XHRpZiAodGhpcy5pc1JlbGF0aXZlKHBhdGgpKSB7XG5cdFx0XHRsZXQgZnVsbFBhdGg7XG5cblx0XHRcdGlmIChwYXRoWzBdID09PSAnLycgfHwgL15bXFx3XSs6Ly50ZXN0KHBhdGgpKSB7XG5cdFx0XHRcdC8vIHBhdGggc3RhcnQgZm9ybSB0aGUgcm9vdFxuXHRcdFx0XHQvLyBsaW51eCAtIHVuaXhcdC0+IC9cblx0XHRcdFx0Ly8gd2luZG93c1x0XHQtPiBEOlxuXG5cdFx0XHRcdGZ1bGxQYXRoID0gcGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGxQYXRoID0gcm9vdCArIHRoaXMuRFMgKyBwYXRoO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXRoID0gdGhpcy5qb2IoZnVsbFBhdGgpLnJlcGxhY2UoL14oaHR0cHM/KTpbL10oW14vXSkvLCAnJDE6Ly8kMicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBEbyB0aGUgcGF0aCByZXNvbHZpbmcgam9iLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aFxuXHQgKi9cblx0am9iKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0Y29uc3QgX2luID0gcGF0aC5zcGxpdCh0aGlzLkRTKTtcblx0XHRjb25zdCBvdXQgPSBbXTtcblxuXHRcdC8vIHByZXNlcnZlIGxpbnV4IHJvb3QgZmlyc3QgY2hhciAnLycgbGlrZSBpbjogL3Jvb3QvcGF0aC90by9cblx0XHRpZiAocGF0aFswXSA9PT0gdGhpcy5EUykge1xuXHRcdFx0b3V0LnB1c2goJycpO1xuXHRcdH1cblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgX2luLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBwYXJ0ID0gX2luW2ldO1xuXHRcdFx0Ly8gaWdub3JlIHBhcnQgdGhhdCBoYXZlIG5vIHZhbHVlXG5cdFx0XHRpZiAoIXBhcnQubGVuZ3RoIHx8IHBhcnQgPT09ICcuJykgY29udGludWU7XG5cblx0XHRcdGlmIChwYXJ0ICE9PSAnLi4nKSB7XG5cdFx0XHRcdC8vIGNvb2wgd2UgZm91bmQgYSBuZXcgcGFydFxuXHRcdFx0XHRvdXQucHVzaChwYXJ0KTtcblx0XHRcdH0gZWxzZSBpZiAob3V0Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Ly8gZ29pbmcgYmFjayB1cD8gc3VyZVxuXHRcdFx0XHRvdXQucG9wKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBub3cgaGVyZSB3ZSBkb24ndCBsaWtlXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHQnW1BhdGhSZXNvbHZlcl0gY2xpbWJpbmcgYWJvdmUgcm9vdCBpcyBkYW5nZXJvdXM6ICcgKyBwYXRoLFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghb3V0Lmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuRFM7XG5cdFx0fVxuXG5cdFx0aWYgKG91dC5sZW5ndGggPT09IDEpIHtcblx0XHRcdG91dC5wdXNoKG51bGwpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXQuam9pbih0aGlzLkRTKTtcblx0fSxcblxuXHQvKipcblx0ICogTm9ybWFsaXplIGEgZ2l2ZW4gcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhcblx0ICovXG5cdG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHJldHVybiBwYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgcGF0aCBpcyBhIHJlbGF0aXZlIHBhdGguXG5cdCAqIEBwYXJhbSBwYXRoXG5cdCAqL1xuXHRpc1JlbGF0aXZlKHBhdGg6IGFueSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAoXG5cdFx0XHQvXlxcLnsxLDJ9Wy9cXFxcXT8vLnRlc3QocGF0aCkgfHxcblx0XHRcdC9bL1xcXFxdXFwuezEsMn1bL1xcXFxdLy50ZXN0KHBhdGgpIHx8XG5cdFx0XHQvWy9cXFxcXVxcLnsxLDJ9JC8udGVzdChwYXRoKSB8fFxuXHRcdFx0L15bYS16QS1aMC05Xy5dW146XSokLy50ZXN0KHBhdGgpXG5cdFx0KTtcblx0fSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBhdGhSZXNvbHZlcjtcbiJdfQ==