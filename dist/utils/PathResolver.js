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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhdGhSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsSUFBSSxZQUFZLEdBQUc7SUFDbEIsRUFBRSxFQUFFLEdBQUc7SUFFUCxPQUFPLEVBQUUsVUFBVSxLQUFhLEVBQUUsSUFBWTtRQUM3QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUIsSUFBSSxTQUFTLENBQUM7WUFFZCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUMsMkJBQTJCO2dCQUMzQixvQkFBb0I7Z0JBQ3BCLGlCQUFpQjtnQkFFakIsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNqQjtpQkFBTTtnQkFDTixTQUFTLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO2FBQ25DO1lBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsR0FBRyxFQUFFLFVBQVUsSUFBWTtRQUMxQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFFYiw2REFBNkQ7UUFDN0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUN4QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2I7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksS0FBSyxHQUFHO2dCQUFFLFNBQVM7WUFFM0MsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNsQiwyQkFBMkI7Z0JBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFFZjtpQkFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixzQkFBc0I7Z0JBQ3RCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNWO2lCQUFNO2dCQUNOLHlCQUF5QjtnQkFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsR0FBRyxJQUFJLENBQUMsQ0FBQzthQUM1RTtTQUNEO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDZjtRQUVELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELFNBQVMsRUFBRSxVQUFVLElBQVk7UUFDaEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsVUFBVSxFQUFFLFVBQVUsSUFBUztRQUM5QixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7ZUFDOUIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztlQUM5QixlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztlQUMxQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNELENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyJ9