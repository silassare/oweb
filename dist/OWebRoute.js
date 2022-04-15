import { escapeRegExp, isArray, isPlainObject, isString } from './utils';
const tokenTypesRegMap = {
    'num': /\d+/.source,
    'alpha': /[a-zA-Z]+/.source,
    'alpha-num': /[a-zA-Z0-9]+/.source,
    'any': /[^/]+/.source,
}, tokenReg = /:([a-z][a-z0-9_]*)/i, stringReg = (str) => new RegExp(escapeRegExp(str)), wrapReg = (str, capture = false) => capture ? '(' + str + ')' : '(?:' + str + ')';
export default class OWebRoute {
    path;
    reg;
    tokens;
    action;
    /**
     * OWebRoute Constructor.
     *
     * @param path The route path string or regexp.
     * @param options The route options.
     * @param action The route action function.
     */
    constructor(path, options, action) {
        if (path instanceof RegExp) {
            this.path = path.toString();
            this.reg = path;
            this.tokens = isArray(options) ? options : [];
        }
        else if (isString(path) && path.length) {
            options = (isPlainObject(options) ? options : {});
            const p = OWebRoute.parseDynamicPath(path, options);
            this.path = path;
            this.reg = p.reg;
            this.tokens = p.tokens;
        }
        else {
            throw new TypeError('[OWebRoute] invalid route path, string or RegExp required.');
        }
        if ('function' !== typeof action) {
            throw new TypeError(`[OWebRoute] invalid action type, got "${typeof action}" instead of "function".`);
        }
        this.action = action;
    }
    /**
     * Returns true if this route is dynamic false otherwise.
     */
    isDynamic() {
        return this.reg != null;
    }
    /**
     * Gets route action.
     */
    getAction() {
        return this.action;
    }
    /**
     * Checks if a given pathname match this route.
     *
     * @param pathname
     */
    is(pathname) {
        return this.reg ? this.reg.test(pathname) : this.path === pathname;
    }
    /**
     * Parse a given pathname.
     *
     * @param pathname
     */
    parse(pathname) {
        if (this.isDynamic()) {
            const founds = String(pathname).match(this.reg);
            if (founds) {
                return this.tokens.reduce((acc, key, index) => {
                    acc[key] = founds[index + 1];
                    return acc;
                }, {});
            }
        }
        return {};
    }
    /**
     * Parse dynamic path and returns appropriate regexp and tokens list.
     *
     * ```js
     * let format = "path/to/:id/file/:index/name.:format";
     * let options = {
     * 		id: "num",
     * 		index: "alpha",
     * 		format:	"alpha-num"
     * };
     * let info = parseDynamicPath(format,options);
     *
     * info === {
     *     reg: RegExp,
     *     tokens: ["id","index","format"]
     * };
     * ```
     * @param path The path format string.
     * @param options The path options.
     */
    static parseDynamicPath(path, options) {
        const tokens = [];
        let reg = '', _path = path, match;
        while ((match = tokenReg.exec(_path)) != null) {
            const found = match[0], token = match[1], rule = options[token] || 'any', head = _path.slice(0, match.index);
            if (head.length) {
                reg += wrapReg(stringReg(head).source);
            }
            if (typeof rule === 'string' && rule in tokenTypesRegMap) {
                reg += wrapReg(tokenTypesRegMap[rule], true);
            }
            else if (rule instanceof RegExp) {
                reg += wrapReg(rule.source, true);
            }
            else {
                throw new Error(`Invalid rule for token ':${token}' in path '${path}'`);
            }
            tokens.push(token);
            _path = _path.slice(match.index + found.length);
        }
        if (!reg.length) {
            return {
                reg: null,
                tokens,
            };
        }
        if (_path.length) {
            reg += wrapReg(stringReg(_path).source);
        }
        return {
            reg: new RegExp('^' + reg + '$'),
            tokens,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJSb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBR3pFLE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNO0lBQ25CLE9BQU8sRUFBRSxXQUFXLENBQUMsTUFBTTtJQUMzQixXQUFXLEVBQUUsY0FBYyxDQUFDLE1BQU07SUFDbEMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ3JCLEVBQ0QsUUFBUSxHQUFHLHFCQUFxQixFQUNoQyxTQUFTLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUMxRCxPQUFPLEdBQUcsQ0FBQyxHQUFXLEVBQUUsT0FBTyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQzFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBVWhELE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBUztJQUNaLElBQUksQ0FBUztJQUNiLEdBQUcsQ0FBZ0I7SUFDNUIsTUFBTSxDQUFXO0lBQ1IsTUFBTSxDQUFlO0lBRXRDOzs7Ozs7T0FNRztJQUNILFlBQ0MsSUFBcUIsRUFDckIsT0FBcUMsRUFDckMsTUFBb0I7UUFFcEIsSUFBSSxJQUFJLFlBQVksTUFBTSxFQUFFO1lBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxD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QUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDdkM7WUFFRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3pELEdBQUcsSUFBSSxPQUFPLENBQUUsZ0JBQXdCLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdEQ7aUJBQU0sSUFBSSxJQUFJLFlBQVksTUFBTSxFQUFFO2dCQUNsQyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDbEM7aUJBQU07Z0JBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsS0FBSyxjQUFjLElBQUksR0FBRyxDQUFDLENBQUM7YUFDeEU7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRW5CLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTztnQkFDTixHQUFHLEVBQUUsSUFBSTtnQkFDVCxNQUFNO2FBQ04sQ0FBQztTQUNGO1FBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2pCLEdBQUcsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsT0FBTztZQUNOLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNoQyxNQUFNO1NBQ04sQ0FBQztJQUNILENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVzY2FwZVJlZ0V4cCwgaXNBcnJheSwgaXNQbGFpbk9iamVjdCwgaXNTdHJpbmcgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmNvbnN0IHRva2VuVHlwZXNSZWdNYXAgPSB7XG5cdFx0J251bSc6IC9cXGQrLy5zb3VyY2UsXG5cdFx0J2FscGhhJzogL1thLXpBLVpdKy8uc291cmNlLFxuXHRcdCdhbHBoYS1udW0nOiAvW2EtekEtWjAtOV0rLy5zb3VyY2UsXG5cdFx0J2FueSc6IC9bXi9dKy8uc291cmNlLFxuXHR9LFxuXHR0b2tlblJlZyA9IC86KFthLXpdW2EtejAtOV9dKikvaSxcblx0c3RyaW5nUmVnID0gKHN0cjogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cChzdHIpKSxcblx0d3JhcFJlZyA9IChzdHI6IHN0cmluZywgY2FwdHVyZSA9IGZhbHNlKSA9PlxuXHRcdGNhcHR1cmUgPyAnKCcgKyBzdHIgKyAnKScgOiAnKD86JyArIHN0ciArICcpJztcblxuZXhwb3J0IHR5cGUgT1JvdXRlUGF0aCA9IHN0cmluZyB8IFJlZ0V4cDtcbmV4cG9ydCB0eXBlIE9Sb3V0ZVBhdGhPcHRpb25zID0ge1xuXHRba2V5OiBzdHJpbmddOiBSZWdFeHAgfCBrZXlvZiB0eXBlb2YgdG9rZW5UeXBlc1JlZ01hcDtcbn07XG5leHBvcnQgdHlwZSBPUm91dGVUb2tlbnMgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuZXhwb3J0IHR5cGUgT1JvdXRlQWN0aW9uID0gKGN0eDogT1dlYlJvdXRlQ29udGV4dCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIE9Sb3V0ZUluZm8gPSB7IHJlZzogUmVnRXhwIHwgbnVsbDsgdG9rZW5zOiBzdHJpbmdbXSB9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUm91dGUge1xuXHRwcml2YXRlIHJlYWRvbmx5IHBhdGg6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSByZWc6IFJlZ0V4cCB8IG51bGw7XG5cdHByaXZhdGUgdG9rZW5zOiBzdHJpbmdbXTtcblx0cHJpdmF0ZSByZWFkb25seSBhY3Rpb246IE9Sb3V0ZUFjdGlvbjtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlIENvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcm91dGUgcGF0aCBzdHJpbmcgb3IgcmVnZXhwLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgcm91dGUgb3B0aW9ucy5cblx0ICogQHBhcmFtIGFjdGlvbiBUaGUgcm91dGUgYWN0aW9uIGZ1bmN0aW9uLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cGF0aDogc3RyaW5nIHwgUmVnRXhwLFxuXHRcdG9wdGlvbnM6IE9Sb3V0ZVBhdGhPcHRpb25zIHwgc3RyaW5nW10sXG5cdFx0YWN0aW9uOiBPUm91dGVBY3Rpb25cblx0KSB7XG5cdFx0aWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdHRoaXMucGF0aCA9IHBhdGgudG9TdHJpbmcoKTtcblx0XHRcdHRoaXMucmVnID0gcGF0aDtcblx0XHRcdHRoaXMudG9rZW5zID0gaXNBcnJheShvcHRpb25zKSA/IG9wdGlvbnMgOiBbXTtcblx0XHR9IGVsc2UgaWYgKGlzU3RyaW5nKHBhdGgpICYmIHBhdGgubGVuZ3RoKSB7XG5cdFx0XHRvcHRpb25zID0gKGlzUGxhaW5PYmplY3Qob3B0aW9ucykgPyBvcHRpb25zIDoge30pIGFzIE9Sb3V0ZVBhdGhPcHRpb25zO1xuXHRcdFx0Y29uc3QgcCA9IE9XZWJSb3V0ZS5wYXJzZUR5bmFtaWNQYXRoKHBhdGgsIG9wdGlvbnMpO1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aDtcblx0XHRcdHRoaXMucmVnID0gcC5yZWc7XG5cdFx0XHR0aGlzLnRva2VucyA9IHAudG9rZW5zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFxuXHRcdFx0XHQnW09XZWJSb3V0ZV0gaW52YWxpZCByb3V0ZSBwYXRoLCBzdHJpbmcgb3IgUmVnRXhwIHJlcXVpcmVkLidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBhY3Rpb24pIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdGBbT1dlYlJvdXRlXSBpbnZhbGlkIGFjdGlvbiB0eXBlLCBnb3QgXCIke3R5cGVvZiBhY3Rpb259XCIgaW5zdGVhZCBvZiBcImZ1bmN0aW9uXCIuYFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0aGlzLmFjdGlvbiA9IGFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyByb3V0ZSBpcyBkeW5hbWljIGZhbHNlIG90aGVyd2lzZS5cblx0ICovXG5cdGlzRHluYW1pYygpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5yZWcgIT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHJvdXRlIGFjdGlvbi5cblx0ICovXG5cdGdldEFjdGlvbigpOiBPUm91dGVBY3Rpb24ge1xuXHRcdHJldHVybiB0aGlzLmFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBnaXZlbiBwYXRobmFtZSBtYXRjaCB0aGlzIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aG5hbWVcblx0ICovXG5cdGlzKHBhdGhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5yZWcgPyB0aGlzLnJlZy50ZXN0KHBhdGhuYW1lKSA6IHRoaXMucGF0aCA9PT0gcGF0aG5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiBwYXRobmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhuYW1lXG5cdCAqL1xuXHRwYXJzZShwYXRobmFtZTogc3RyaW5nKTogT1JvdXRlVG9rZW5zIHtcblx0XHRpZiAodGhpcy5pc0R5bmFtaWMoKSkge1xuXHRcdFx0Y29uc3QgZm91bmRzOiBhbnkgPSBTdHJpbmcocGF0aG5hbWUpLm1hdGNoKHRoaXMucmVnIGFzIFJlZ0V4cCk7XG5cblx0XHRcdGlmIChmb3VuZHMpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMudG9rZW5zLnJlZHVjZSgoYWNjOiBhbnksIGtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdFx0YWNjW2tleV0gPSBmb3VuZHNbaW5kZXggKyAxXTtcblx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHR9LCB7fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGR5bmFtaWMgcGF0aCBhbmQgcmV0dXJucyBhcHByb3ByaWF0ZSByZWdleHAgYW5kIHRva2VucyBsaXN0LlxuXHQgKlxuXHQgKiBgYGBqc1xuXHQgKiBsZXQgZm9ybWF0ID0gXCJwYXRoL3RvLzppZC9maWxlLzppbmRleC9uYW1lLjpmb3JtYXRcIjtcblx0ICogbGV0IG9wdGlvbnMgPSB7XG5cdCAqIFx0XHRpZDogXCJudW1cIixcblx0ICogXHRcdGluZGV4OiBcImFscGhhXCIsXG5cdCAqIFx0XHRmb3JtYXQ6XHRcImFscGhhLW51bVwiXG5cdCAqIH07XG5cdCAqIGxldCBpbmZvID0gcGFyc2VEeW5hbWljUGF0aChmb3JtYXQsb3B0aW9ucyk7XG5cdCAqXG5cdCAqIGluZm8gPT09IHtcblx0ICogICAgIHJlZzogUmVnRXhwLFxuXHQgKiAgICAgdG9rZW5zOiBbXCJpZFwiLFwiaW5kZXhcIixcImZvcm1hdFwiXVxuXHQgKiB9O1xuXHQgKiBgYGBcblx0ICogQHBhcmFtIHBhdGggVGhlIHBhdGggZm9ybWF0IHN0cmluZy5cblx0ICogQHBhcmFtIG9wdGlvbnMgVGhlIHBhdGggb3B0aW9ucy5cblx0ICovXG5cdHN0YXRpYyBwYXJzZUR5bmFtaWNQYXRoKFxuXHRcdHBhdGg6IHN0cmluZyxcblx0XHRvcHRpb25zOiBPUm91dGVQYXRoT3B0aW9uc1xuXHQpOiBPUm91dGVJbmZvIHtcblx0XHRjb25zdCB0b2tlbnM6IHN0cmluZ1tdID0gW107XG5cdFx0bGV0IHJlZyA9ICcnLFxuXHRcdFx0X3BhdGg6IHN0cmluZyA9IHBhdGgsXG5cdFx0XHRtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuXHRcdHdoaWxlICgobWF0Y2ggPSB0b2tlblJlZy5leGVjKF9wYXRoKSkgIT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgZm91bmQ6IGFueSA9IG1hdGNoWzBdLFxuXHRcdFx0XHR0b2tlbjogYW55ID0gbWF0Y2hbMV0sXG5cdFx0XHRcdHJ1bGU6IGFueSA9IG9wdGlvbnNbdG9rZW5dIHx8ICdhbnknLFxuXHRcdFx0XHRoZWFkOiBzdHJpbmcgPSBfcGF0aC5zbGljZSgwLCBtYXRjaC5pbmRleCk7XG5cblx0XHRcdGlmIChoZWFkLmxlbmd0aCkge1xuXHRcdFx0XHRyZWcgKz0gd3JhcFJlZyhzdHJpbmdSZWcoaGVhZCkuc291cmNlKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJyAmJiBydWxlIGluIHRva2VuVHlwZXNSZWdNYXApIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoKHRva2VuVHlwZXNSZWdNYXAgYXMgYW55KVtydWxlXSwgdHJ1ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcocnVsZS5zb3VyY2UsIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJ1bGUgZm9yIHRva2VuICc6JHt0b2tlbn0nIGluIHBhdGggJyR7cGF0aH0nYCk7XG5cdFx0XHR9XG5cblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblxuXHRcdFx0X3BhdGggPSBfcGF0aC5zbGljZShtYXRjaC5pbmRleCArIGZvdW5kLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFyZWcubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZWc6IG51bGwsXG5cdFx0XHRcdHRva2Vucyxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKF9wYXRoLmxlbmd0aCkge1xuXHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKF9wYXRoKS5zb3VyY2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZWc6IG5ldyBSZWdFeHAoJ14nICsgcmVnICsgJyQnKSxcblx0XHRcdHRva2Vucyxcblx0XHR9O1xuXHR9XG59XG4iXX0=