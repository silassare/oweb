import { escapeRegExp, isArray, isPlainObject, isString } from './utils';
const tokenTypesRegMap = {
    'num': /\d+/.source,
    'alpha': /[a-zA-Z]+/.source,
    'alpha-fullUrl': /[a-z]+/.source,
    'alpha-l': /[A-Z]+/.source,
    'alpha-num': /[a-zA-Z0-9]+/.source,
    'alpha-num-l': /[a-z0-9]+/.source,
    'alpha-num-fullUrl': /[A-Z0-9]+/.source,
    'any': /[^/]+/.source,
}, tokenReg = /:([a-z][a-z0-9_]*)/i, stringReg = function (str) {
    return new RegExp(escapeRegExp(str));
}, wrapReg = (str, capture = false) => capture ? '(' + str + ')' : '(?:' + str + ')';
export default class OWebRoute {
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
            options = (isPlainObject(options)
                ? options
                : {});
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
        // tslint:disable-next-line: no-conditional-assignment
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJSb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBV3pFLE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNO0lBQ25CLE9BQU8sRUFBRSxXQUFXLENBQUMsTUFBTTtJQUMzQixlQUFlLEVBQUUsUUFBUSxDQUFDLE1BQU07SUFDaEMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNO0lBQzFCLFdBQVcsRUFBRSxjQUFjLENBQUMsTUFBTTtJQUNsQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDdkMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ3JCLEVBQ0QsUUFBUSxHQUFHLHFCQUFxQixFQUNoQyxTQUFTLEdBQUcsVUFBVSxHQUFXO0lBQ2hDLE9BQU8sSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEMsQ0FBQyxFQUNELE9BQU8sR0FBRyxDQUFDLEdBQVcsRUFBRSxVQUFtQixLQUFLLEVBQUUsRUFBRSxDQUNuRCxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUVoRCxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVM7SUFNN0I7Ozs7OztPQU1HO0lBQ0gsWUFDQyxJQUFxQixFQUNyQixPQUFxQyxFQUNyQyxNQUFvQjtRQUVwQixJQUFJLElBQUksWUFBWSxNQUFNLEVBQUU7WUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDNUIsSUFBSSxD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OlsiaW1wb3J0IHsgZXNjYXBlUmVnRXhwLCBpc0FycmF5LCBpc1BsYWluT2JqZWN0LCBpc1N0cmluZyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IE9XZWJSb3V0ZUNvbnRleHQgZnJvbSAnLi9PV2ViUm91dGVDb250ZXh0JztcblxuZXhwb3J0IHR5cGUgdFJvdXRlUGF0aCA9IHN0cmluZyB8IFJlZ0V4cDtcbmV4cG9ydCB0eXBlIHRSb3V0ZVBhdGhPcHRpb25zID0ge1xuXHRba2V5OiBzdHJpbmddOiBSZWdFeHAgfCBrZXlvZiB0eXBlb2YgdG9rZW5UeXBlc1JlZ01hcDtcbn07XG5leHBvcnQgdHlwZSB0Um91dGVUb2tlbnNNYXAgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgdFJvdXRlQWN0aW9uID0gKGN0eDogT1dlYlJvdXRlQ29udGV4dCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRSb3V0ZUluZm8gPSB7IHJlZzogUmVnRXhwIHwgbnVsbDsgdG9rZW5zOiBzdHJpbmdbXSB9O1xuXG5jb25zdCB0b2tlblR5cGVzUmVnTWFwID0ge1xuXHRcdCdudW0nOiAvXFxkKy8uc291cmNlLFxuXHRcdCdhbHBoYSc6IC9bYS16QS1aXSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtZnVsbFVybCc6IC9bYS16XSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbCc6IC9bQS1aXSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbnVtJzogL1thLXpBLVowLTldKy8uc291cmNlLFxuXHRcdCdhbHBoYS1udW0tbCc6IC9bYS16MC05XSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbnVtLWZ1bGxVcmwnOiAvW0EtWjAtOV0rLy5zb3VyY2UsXG5cdFx0J2FueSc6IC9bXi9dKy8uc291cmNlLFxuXHR9LFxuXHR0b2tlblJlZyA9IC86KFthLXpdW2EtejAtOV9dKikvaSxcblx0c3RyaW5nUmVnID0gZnVuY3Rpb24gKHN0cjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIG5ldyBSZWdFeHAoZXNjYXBlUmVnRXhwKHN0cikpO1xuXHR9LFxuXHR3cmFwUmVnID0gKHN0cjogc3RyaW5nLCBjYXB0dXJlOiBib29sZWFuID0gZmFsc2UpID0+XG5cdFx0Y2FwdHVyZSA/ICcoJyArIHN0ciArICcpJyA6ICcoPzonICsgc3RyICsgJyknO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUm91dGUge1xuXHRwcml2YXRlIHJlYWRvbmx5IHBhdGg6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSByZWc6IFJlZ0V4cCB8IG51bGw7XG5cdHByaXZhdGUgdG9rZW5zOiBzdHJpbmdbXTtcblx0cHJpdmF0ZSByZWFkb25seSBhY3Rpb246IHRSb3V0ZUFjdGlvbjtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlIENvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcm91dGUgcGF0aCBzdHJpbmcgb3IgcmVnZXhwLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgcm91dGUgb3B0aW9ucy5cblx0ICogQHBhcmFtIGFjdGlvbiBUaGUgcm91dGUgYWN0aW9uIGZ1bmN0aW9uLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cGF0aDogc3RyaW5nIHwgUmVnRXhwLFxuXHRcdG9wdGlvbnM6IHRSb3V0ZVBhdGhPcHRpb25zIHwgc3RyaW5nW10sXG5cdFx0YWN0aW9uOiB0Um91dGVBY3Rpb24sXG5cdCkge1xuXHRcdGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoLnRvU3RyaW5nKCk7XG5cdFx0XHR0aGlzLnJlZyA9IHBhdGg7XG5cdFx0XHR0aGlzLnRva2VucyA9IGlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zIDogW107XG5cdFx0fSBlbHNlIGlmIChpc1N0cmluZyhwYXRoKSAmJiBwYXRoLmxlbmd0aCkge1xuXHRcdFx0b3B0aW9ucyA9IChpc1BsYWluT2JqZWN0KG9wdGlvbnMpXG5cdFx0XHRcdD8gb3B0aW9uc1xuXHRcdFx0XHQ6IHt9KSBhcyB0Um91dGVQYXRoT3B0aW9ucztcblx0XHRcdGNvbnN0IHAgPSBPV2ViUm91dGUucGFyc2VEeW5hbWljUGF0aChwYXRoLCBvcHRpb25zKTtcblx0XHRcdHRoaXMucGF0aCA9IHBhdGg7XG5cdFx0XHR0aGlzLnJlZyA9IHAucmVnO1xuXHRcdFx0dGhpcy50b2tlbnMgPSBwLnRva2Vucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViUm91dGVdIGludmFsaWQgcm91dGUgcGF0aCwgc3RyaW5nIG9yIFJlZ0V4cCByZXF1aXJlZC4nLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGFjdGlvbikge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0YFtPV2ViUm91dGVdIGludmFsaWQgYWN0aW9uIHR5cGUsIGdvdCBcIiR7dHlwZW9mIGFjdGlvbn1cIiBpbnN0ZWFkIG9mIFwiZnVuY3Rpb25cIi5gLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0aGlzLmFjdGlvbiA9IGFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyByb3V0ZSBpcyBkeW5hbWljIGZhbHNlIG90aGVyd2lzZS5cblx0ICovXG5cdGlzRHluYW1pYygpIHtcblx0XHRyZXR1cm4gdGhpcy5yZWcgIT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHJvdXRlIGFjdGlvbi5cblx0ICovXG5cdGdldEFjdGlvbigpOiB0Um91dGVBY3Rpb24ge1xuXHRcdHJldHVybiB0aGlzLmFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBnaXZlbiBwYXRobmFtZSBtYXRjaCB0aGlzIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aG5hbWVcblx0ICovXG5cdGlzKHBhdGhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5yZWcgPyB0aGlzLnJlZy50ZXN0KHBhdGhuYW1lKSA6IHRoaXMucGF0aCA9PT0gcGF0aG5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiBwYXRobmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhuYW1lXG5cdCAqL1xuXHRwYXJzZShwYXRobmFtZTogc3RyaW5nKTogdFJvdXRlVG9rZW5zTWFwIHtcblx0XHRpZiAodGhpcy5pc0R5bmFtaWMoKSkge1xuXHRcdFx0Y29uc3QgZm91bmRzOiBhbnkgPSBTdHJpbmcocGF0aG5hbWUpLm1hdGNoKHRoaXMucmVnIGFzIFJlZ0V4cCk7XG5cblx0XHRcdGlmIChmb3VuZHMpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMudG9rZW5zLnJlZHVjZShcblx0XHRcdFx0XHQoYWNjOiBhbnksIGtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdFx0XHRhY2Nba2V5XSA9IGZvdW5kc1tpbmRleCArIDFdO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHt9LFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBkeW5hbWljIHBhdGggYW5kIHJldHVybnMgYXBwcm9wcmlhdGUgcmVnZXhwIGFuZCB0b2tlbnMgbGlzdC5cblx0ICpcblx0ICogYGBganNcblx0ICogbGV0IGZvcm1hdCA9IFwicGF0aC90by86aWQvZmlsZS86aW5kZXgvbmFtZS46Zm9ybWF0XCI7XG5cdCAqIGxldCBvcHRpb25zID0ge1xuXHQgKiBcdFx0aWQ6IFwibnVtXCIsXG5cdCAqIFx0XHRpbmRleDogXCJhbHBoYVwiLFxuXHQgKiBcdFx0Zm9ybWF0Olx0XCJhbHBoYS1udW1cIlxuXHQgKiB9O1xuXHQgKiBsZXQgaW5mbyA9IHBhcnNlRHluYW1pY1BhdGgoZm9ybWF0LG9wdGlvbnMpO1xuXHQgKlxuXHQgKiBpbmZvID09PSB7XG5cdCAqICAgICByZWc6IFJlZ0V4cCxcblx0ICogICAgIHRva2VuczogW1wiaWRcIixcImluZGV4XCIsXCJmb3JtYXRcIl1cblx0ICogfTtcblx0ICogYGBgXG5cdCAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIGZvcm1hdCBzdHJpbmcuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSBwYXRoIG9wdGlvbnMuXG5cdCAqL1xuXHRzdGF0aWMgcGFyc2VEeW5hbWljUGF0aChcblx0XHRwYXRoOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogdFJvdXRlUGF0aE9wdGlvbnMsXG5cdCk6IHRSb3V0ZUluZm8ge1xuXHRcdGNvbnN0IHRva2Vuczogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgcmVnOiBzdHJpbmcgPSAnJyxcblx0XHRcdF9wYXRoOiBzdHJpbmcgPSBwYXRoLFxuXHRcdFx0bWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG5cblx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHR3aGlsZSAoKG1hdGNoID0gdG9rZW5SZWcuZXhlYyhfcGF0aCkpICE9IG51bGwpIHtcblx0XHRcdGNvbnN0IGZvdW5kOiBhbnkgPSBtYXRjaFswXSxcblx0XHRcdFx0dG9rZW46IGFueSA9IG1hdGNoWzFdLFxuXHRcdFx0XHRydWxlOiBhbnkgPSBvcHRpb25zW3Rva2VuXSB8fCAnYW55Jyxcblx0XHRcdFx0aGVhZDogc3RyaW5nID0gX3BhdGguc2xpY2UoMCwgbWF0Y2guaW5kZXgpO1xuXG5cdFx0XHRpZiAoaGVhZC5sZW5ndGgpIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKGhlYWQpLnNvdXJjZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycgJiYgcnVsZSBpbiB0b2tlblR5cGVzUmVnTWFwKSB7XG5cdFx0XHRcdHJlZyArPSB3cmFwUmVnKCh0b2tlblR5cGVzUmVnTWFwIGFzIGFueSlbcnVsZV0sIHRydWUpO1xuXHRcdFx0fSBlbHNlIGlmIChydWxlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdHJlZyArPSB3cmFwUmVnKHJ1bGUuc291cmNlLCB0cnVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRgSW52YWxpZCBydWxlIGZvciB0b2tlbiAnOiR7dG9rZW59JyBpbiBwYXRoICcke3BhdGh9J2AsXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblxuXHRcdFx0X3BhdGggPSBfcGF0aC5zbGljZShtYXRjaC5pbmRleCArIGZvdW5kLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFyZWcubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZWc6IG51bGwsXG5cdFx0XHRcdHRva2Vucyxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKF9wYXRoLmxlbmd0aCkge1xuXHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKF9wYXRoKS5zb3VyY2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZWc6IG5ldyBSZWdFeHAoJ14nICsgcmVnICsgJyQnKSxcblx0XHRcdHRva2Vucyxcblx0XHR9O1xuXHR9XG59XG4iXX0=