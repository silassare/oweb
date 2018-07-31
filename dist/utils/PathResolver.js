/*
 * Copyright (c) Emile Silas Sare <emile.silas@gmail.com>
 *
 * This file is part of Otpl.
 */
let PathResolver = {
    DS: "/",
    resolve: function (ro_ot, path) {
        ro_ot = this.normalize(ro_ot);
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
                full_path = ro_ot + this.DS + path;
            }
            path = this.job(full_path).replace(/^(https?):[/]([^/])/, "$1://$2");
        }
        return path;
    },
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
    normalize: function (path) {
        return path.replace(/\\/g, "/");
    },
    isRelative: function (path) {
        return /^\.{1,2}[/\\]?/.test(path)
            || /[/\\]\.{1,2}[/\\]/.test(path)
            || /[/\\]\.{1,2}$/.test(path)
            || /^[a-zA-Z0-9_.][^:]*$/.test(path);
    }
};
export default PathResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhdGhSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsSUFBSSxZQUFZLEdBQUc7SUFDbEIsRUFBRSxFQUFFLEdBQUc7SUFFUCxPQUFPLEVBQUUsVUFBVSxLQUFhLEVBQUUsSUFBWTtRQUM3QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUIsSUFBSSxTQUFTLENBQUM7WUFFZCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUMsMkJBQTJCO2dCQUMzQixvQkFBb0I7Z0JBQ3BCLGlCQUFpQjtnQkFFakIsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNqQjtpQkFBTTtnQkFDTixTQUFTLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO2FBQ25DO1lBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsR0FBRyxFQUFFLFVBQVUsSUFBWTtRQUMxQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFFYiw2REFBNkQ7UUFDN0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUN4QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2I7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksS0FBSyxHQUFHO2dCQUFFLFNBQVM7WUFFM0MsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNsQiwyQkFBMkI7Z0JBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFFZjtpQkFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixzQkFBc0I7Z0JBQ3RCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNWO2lCQUFNO2dCQUNOLHlCQUF5QjtnQkFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsR0FBRyxJQUFJLENBQUMsQ0FBQzthQUM1RTtTQUNEO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDZjtRQUVELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELFNBQVMsRUFBRSxVQUFVLElBQVk7UUFDaEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsVUFBVSxFQUFFLFVBQVUsSUFBUztRQUM5QixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7ZUFDOUIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztlQUM5QixlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztlQUMxQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNELENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgKGMpIEVtaWxlIFNpbGFzIFNhcmUgPGVtaWxlLnNpbGFzQGdtYWlsLmNvbT5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBPdHBsLlxuICovXG5cbmxldCBQYXRoUmVzb2x2ZXIgPSB7XG5cdERTOiBcIi9cIixcblxuXHRyZXNvbHZlOiBmdW5jdGlvbiAocm9fb3Q6IHN0cmluZywgcGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyb19vdCA9IHRoaXMubm9ybWFsaXplKHJvX290KTtcblx0XHRwYXRoICA9IHRoaXMubm9ybWFsaXplKHBhdGgpO1xuXG5cdFx0aWYgKHRoaXMuaXNSZWxhdGl2ZShwYXRoKSkge1xuXHRcdFx0bGV0IGZ1bGxfcGF0aDtcblxuXHRcdFx0aWYgKHBhdGhbMF0gPT09IFwiL1wiIHx8IC9eW1xcd10rOi8udGVzdChwYXRoKSkge1xuXHRcdFx0XHQvLyBwYXRoIHN0YXJ0IGZvcm0gdGhlIHJvb3Rcblx0XHRcdFx0Ly8gbGludXggLSB1bml4XHQtPiAvXG5cdFx0XHRcdC8vIHdpbmRvd3NcdFx0LT4gRDpcblxuXHRcdFx0XHRmdWxsX3BhdGggPSBwYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsbF9wYXRoID0gcm9fb3QgKyB0aGlzLkRTICsgcGF0aDtcblx0XHRcdH1cblxuXHRcdFx0cGF0aCA9IHRoaXMuam9iKGZ1bGxfcGF0aCkucmVwbGFjZSgvXihodHRwcz8pOlsvXShbXi9dKS8sIFwiJDE6Ly8kMlwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aDtcblx0fSxcblxuXHRqb2I6IGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGxldCBfaW4gPSBwYXRoLnNwbGl0KHRoaXMuRFMpO1xuXHRcdGxldCBvdXQgPSBbXTtcblxuXHRcdC8vIHByZXNlcnZlIGxpbnV4IHJvb3QgZmlyc3QgY2hhciAnLycgbGlrZSBpbjogL3Jvb3QvcGF0aC90by9cblx0XHRpZiAocGF0aFswXSA9PT0gdGhpcy5EUykge1xuXHRcdFx0b3V0LnB1c2goXCJcIik7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBfaW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBwYXJ0ID0gX2luW2ldO1xuXHRcdFx0Ly8gaWdub3JlIHBhcnQgdGhhdCBoYXZlIG5vIHZhbHVlXG5cdFx0XHRpZiAoIXBhcnQubGVuZ3RoIHx8IHBhcnQgPT09IFwiLlwiKSBjb250aW51ZTtcblxuXHRcdFx0aWYgKHBhcnQgIT09IFwiLi5cIikge1xuXHRcdFx0XHQvLyBjb29sIHdlIGZvdW5kIGEgbmV3IHBhcnRcblx0XHRcdFx0b3V0LnB1c2gocGFydCk7XG5cblx0XHRcdH0gZWxzZSBpZiAob3V0Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Ly8gZ29pbmcgYmFjayB1cD8gc3VyZVxuXHRcdFx0XHRvdXQucG9wKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBub3cgaGVyZSB3ZSBkb24ndCBsaWtlXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIltQYXRoUmVzb2x2ZXJdIGNsaW1iaW5nIGFib3ZlIHJvb3QgaXMgZGFuZ2Vyb3VzOiBcIiArIHBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghb3V0Lmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuRFM7XG5cdFx0fVxuXG5cdFx0aWYgKG91dC5sZW5ndGggPT09IDEpIHtcblx0XHRcdG91dC5wdXNoKG51bGwpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXQuam9pbih0aGlzLkRTKTtcblx0fSxcblxuXHRub3JtYWxpemU6IGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHJldHVybiBwYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xuXHR9LFxuXG5cdGlzUmVsYXRpdmU6IGZ1bmN0aW9uIChwYXRoOiBhbnkpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gL15cXC57MSwyfVsvXFxcXF0/Ly50ZXN0KHBhdGgpXG5cdFx0XHR8fCAvWy9cXFxcXVxcLnsxLDJ9Wy9cXFxcXS8udGVzdChwYXRoKVxuXHRcdFx0fHwgL1svXFxcXF1cXC57MSwyfSQvLnRlc3QocGF0aClcblx0XHRcdHx8IC9eW2EtekEtWjAtOV8uXVteOl0qJC8udGVzdChwYXRoKTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgUGF0aFJlc29sdmVyOyJdfQ==