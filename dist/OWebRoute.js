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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJSb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR3ZFLE1BQU0sZ0JBQWdCLEdBQUc7SUFDckIsS0FBSyxFQUFnQixLQUFLLENBQUMsTUFBTTtJQUNqQyxPQUFPLEVBQWMsV0FBVyxDQUFDLE1BQU07SUFDdkMsZUFBZSxFQUFNLFFBQVEsQ0FBQyxNQUFNO0lBQ3BDLFNBQVMsRUFBWSxRQUFRLENBQUMsTUFBTTtJQUNwQyxXQUFXLEVBQVUsY0FBYyxDQUFDLE1BQU07SUFDMUMsYUFBYSxFQUFRLFdBQVcsQ0FBQyxNQUFNO0lBQ3ZDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxNQUFNO0lBQ3ZDLEtBQUssRUFBZ0IsT0FBTyxDQUFDLE1BQU07Q0FDbkMsRUFDRCxRQUFRLEdBQVcscUJBQXFCLEVBQ3hDLFNBQVMsR0FBVSxVQUFVLEdBQVc7SUFDdkMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDLEVBQ0QsT0FBTyxHQUFZLENBQUMsR0FBVyxFQUFFLE9BQU8sR0FBRyxLQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBVXRHLE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBUztJQU03Qjs7Ozs7O09BTUc7SUFDSCxZQUNDLElBQXFCLEVBQ3JCLE9BQXFDLEVBQ3JDLE1BQW9CO1FBRXBCLElBQUksSUFBSSxZQUFZLE1BQU0sRUFBRTtZQUMzQixJQUFJLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QixJ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b3J0IHtlc2NhcGVSZWdFeHAsIGlzQXJyYXksIGlzUGxhaW5PYmplY3QsIGlzU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmNvbnN0IHRva2VuVHlwZXNSZWdNYXAgPSB7XG5cdFx0ICAnbnVtJyAgICAgICAgICAgICAgOiAvXFxkKy8uc291cmNlLFxuXHRcdCAgJ2FscGhhJyAgICAgICAgICAgIDogL1thLXpBLVpdKy8uc291cmNlLFxuXHRcdCAgJ2FscGhhLWZ1bGxVcmwnICAgIDogL1thLXpdKy8uc291cmNlLFxuXHRcdCAgJ2FscGhhLWwnICAgICAgICAgIDogL1tBLVpdKy8uc291cmNlLFxuXHRcdCAgJ2FscGhhLW51bScgICAgICAgIDogL1thLXpBLVowLTldKy8uc291cmNlLFxuXHRcdCAgJ2FscGhhLW51bS1sJyAgICAgIDogL1thLXowLTldKy8uc291cmNlLFxuXHRcdCAgJ2FscGhhLW51bS1mdWxsVXJsJzogL1tBLVowLTldKy8uc291cmNlLFxuXHRcdCAgJ2FueScgICAgICAgICAgICAgIDogL1teL10rLy5zb3VyY2UsXG5cdCAgfSxcblx0ICB0b2tlblJlZyAgICAgICAgID0gLzooW2Etel1bYS16MC05X10qKS9pLFxuXHQgIHN0cmluZ1JlZyAgICAgICAgPSBmdW5jdGlvbiAoc3RyOiBzdHJpbmcpIHtcblx0XHQgIHJldHVybiBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cChzdHIpKTtcblx0ICB9LFxuXHQgIHdyYXBSZWcgICAgICAgICAgPSAoc3RyOiBzdHJpbmcsIGNhcHR1cmUgPSBmYWxzZSkgPT4gY2FwdHVyZSA/ICcoJyArIHN0ciArICcpJyA6ICcoPzonICsgc3RyICsgJyknO1xuXG5leHBvcnQgdHlwZSBPUm91dGVQYXRoID0gc3RyaW5nIHwgUmVnRXhwO1xuZXhwb3J0IHR5cGUgT1JvdXRlUGF0aE9wdGlvbnMgPSB7XG5cdFtrZXk6IHN0cmluZ106IFJlZ0V4cCB8IGtleW9mIHR5cGVvZiB0b2tlblR5cGVzUmVnTWFwO1xufTtcbmV4cG9ydCB0eXBlIE9Sb3V0ZVRva2Vuc01hcCA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG5leHBvcnQgdHlwZSBPUm91dGVBY3Rpb24gPSAoY3R4OiBPV2ViUm91dGVDb250ZXh0KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgT1JvdXRlSW5mbyA9IHsgcmVnOiBSZWdFeHAgfCBudWxsOyB0b2tlbnM6IHN0cmluZ1tdIH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZSB7XG5cdHByaXZhdGUgcmVhZG9ubHkgcGF0aDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IHJlZzogUmVnRXhwIHwgbnVsbDtcblx0cHJpdmF0ZSB0b2tlbnM6IHN0cmluZ1tdO1xuXHRwcml2YXRlIHJlYWRvbmx5IGFjdGlvbjogT1JvdXRlQWN0aW9uO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGUgQ29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIFRoZSByb3V0ZSBwYXRoIHN0cmluZyBvciByZWdleHAuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSByb3V0ZSBvcHRpb25zLlxuXHQgKiBAcGFyYW0gYWN0aW9uIFRoZSByb3V0ZSBhY3Rpb24gZnVuY3Rpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwYXRoOiBzdHJpbmcgfCBSZWdFeHAsXG5cdFx0b3B0aW9uczogT1JvdXRlUGF0aE9wdGlvbnMgfCBzdHJpbmdbXSxcblx0XHRhY3Rpb246IE9Sb3V0ZUFjdGlvbixcblx0KSB7XG5cdFx0aWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdHRoaXMucGF0aCAgID0gcGF0aC50b1N0cmluZygpO1xuXHRcdFx0dGhpcy5yZWcgICAgPSBwYXRoO1xuXHRcdFx0dGhpcy50b2tlbnMgPSBpc0FycmF5KG9wdGlvbnMpID8gb3B0aW9ucyA6IFtdO1xuXHRcdH0gZWxzZSBpZiAoaXNTdHJpbmcocGF0aCkgJiYgcGF0aC5sZW5ndGgpIHtcblx0XHRcdG9wdGlvbnMgICAgID0gKGlzUGxhaW5PYmplY3Qob3B0aW9ucylcblx0XHRcdFx0XHRcdCAgID8gb3B0aW9uc1xuXHRcdFx0XHRcdFx0ICAgOiB7fSkgYXMgT1JvdXRlUGF0aE9wdGlvbnM7XG5cdFx0XHRjb25zdCBwICAgICA9IE9XZWJSb3V0ZS5wYXJzZUR5bmFtaWNQYXRoKHBhdGgsIG9wdGlvbnMpO1xuXHRcdFx0dGhpcy5wYXRoICAgPSBwYXRoO1xuXHRcdFx0dGhpcy5yZWcgICAgPSBwLnJlZztcblx0XHRcdHRoaXMudG9rZW5zID0gcC50b2tlbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYlJvdXRlXSBpbnZhbGlkIHJvdXRlIHBhdGgsIHN0cmluZyBvciBSZWdFeHAgcmVxdWlyZWQuJyxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBhY3Rpb24pIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdGBbT1dlYlJvdXRlXSBpbnZhbGlkIGFjdGlvbiB0eXBlLCBnb3QgXCIke3R5cGVvZiBhY3Rpb259XCIgaW5zdGVhZCBvZiBcImZ1bmN0aW9uXCIuYCxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hY3Rpb24gPSBhY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoaXMgcm91dGUgaXMgZHluYW1pYyBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRpc0R5bmFtaWMoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVnICE9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyByb3V0ZSBhY3Rpb24uXG5cdCAqL1xuXHRnZXRBY3Rpb24oKTogT1JvdXRlQWN0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5hY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgZ2l2ZW4gcGF0aG5hbWUgbWF0Y2ggdGhpcyByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhuYW1lXG5cdCAqL1xuXHRpcyhwYXRobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMucmVnID8gdGhpcy5yZWcudGVzdChwYXRobmFtZSkgOiB0aGlzLnBhdGggPT09IHBhdGhuYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gcGF0aG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRobmFtZVxuXHQgKi9cblx0cGFyc2UocGF0aG5hbWU6IHN0cmluZyk6IE9Sb3V0ZVRva2Vuc01hcCB7XG5cdFx0aWYgKHRoaXMuaXNEeW5hbWljKCkpIHtcblx0XHRcdGNvbnN0IGZvdW5kczogYW55ID0gU3RyaW5nKHBhdGhuYW1lKS5tYXRjaCh0aGlzLnJlZyBhcyBSZWdFeHApO1xuXG5cdFx0XHRpZiAoZm91bmRzKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnRva2Vucy5yZWR1Y2UoXG5cdFx0XHRcdFx0KGFjYzogYW55LCBrZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xuXHRcdFx0XHRcdFx0YWNjW2tleV0gPSBmb3VuZHNbaW5kZXggKyAxXTtcblx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7fSxcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgZHluYW1pYyBwYXRoIGFuZCByZXR1cm5zIGFwcHJvcHJpYXRlIHJlZ2V4cCBhbmQgdG9rZW5zIGxpc3QuXG5cdCAqXG5cdCAqIGBgYGpzXG5cdCAqIGxldCBmb3JtYXQgPSBcInBhdGgvdG8vOmlkL2ZpbGUvOmluZGV4L25hbWUuOmZvcm1hdFwiO1xuXHQgKiBsZXQgb3B0aW9ucyA9IHtcblx0ICogXHRcdGlkOiBcIm51bVwiLFxuXHQgKiBcdFx0aW5kZXg6IFwiYWxwaGFcIixcblx0ICogXHRcdGZvcm1hdDpcdFwiYWxwaGEtbnVtXCJcblx0ICogfTtcblx0ICogbGV0IGluZm8gPSBwYXJzZUR5bmFtaWNQYXRoKGZvcm1hdCxvcHRpb25zKTtcblx0ICpcblx0ICogaW5mbyA9PT0ge1xuXHQgKiAgICAgcmVnOiBSZWdFeHAsXG5cdCAqICAgICB0b2tlbnM6IFtcImlkXCIsXCJpbmRleFwiLFwiZm9ybWF0XCJdXG5cdCAqIH07XG5cdCAqIGBgYFxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBmb3JtYXQgc3RyaW5nLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgcGF0aCBvcHRpb25zLlxuXHQgKi9cblx0c3RhdGljIHBhcnNlRHluYW1pY1BhdGgoXG5cdFx0cGF0aDogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IE9Sb3V0ZVBhdGhPcHRpb25zLFxuXHQpOiBPUm91dGVJbmZvIHtcblx0XHRjb25zdCB0b2tlbnM6IHN0cmluZ1tdID0gW107XG5cdFx0bGV0IHJlZyAgICAgICAgICAgICAgICA9ICcnLFxuXHRcdFx0X3BhdGg6IHN0cmluZyAgICAgID0gcGF0aCxcblx0XHRcdG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG5cdFx0d2hpbGUgKChtYXRjaCA9IHRva2VuUmVnLmV4ZWMoX3BhdGgpKSAhPSBudWxsKSB7XG5cdFx0XHRjb25zdCBmb3VuZDogYW55ICAgPSBtYXRjaFswXSxcblx0XHRcdFx0ICB0b2tlbjogYW55ICAgPSBtYXRjaFsxXSxcblx0XHRcdFx0ICBydWxlOiBhbnkgICAgPSBvcHRpb25zW3Rva2VuXSB8fCAnYW55Jyxcblx0XHRcdFx0ICBoZWFkOiBzdHJpbmcgPSBfcGF0aC5zbGljZSgwLCBtYXRjaC5pbmRleCk7XG5cblx0XHRcdGlmIChoZWFkLmxlbmd0aCkge1xuXHRcdFx0XHRyZWcgKz0gd3JhcFJlZyhzdHJpbmdSZWcoaGVhZCkuc291cmNlKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJyAmJiBydWxlIGluIHRva2VuVHlwZXNSZWdNYXApIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoKHRva2VuVHlwZXNSZWdNYXAgYXMgYW55KVtydWxlXSwgdHJ1ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcocnVsZS5zb3VyY2UsIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdGBJbnZhbGlkIHJ1bGUgZm9yIHRva2VuICc6JHt0b2tlbn0nIGluIHBhdGggJyR7cGF0aH0nYCxcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0dG9rZW5zLnB1c2godG9rZW4pO1xuXG5cdFx0XHRfcGF0aCA9IF9wYXRoLnNsaWNlKG1hdGNoLmluZGV4ICsgZm91bmQubGVuZ3RoKTtcblx0XHR9XG5cblx0XHRpZiAoIXJlZy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHJlZzogbnVsbCxcblx0XHRcdFx0dG9rZW5zLFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoX3BhdGgubGVuZ3RoKSB7XG5cdFx0XHRyZWcgKz0gd3JhcFJlZyhzdHJpbmdSZWcoX3BhdGgpLnNvdXJjZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlZzogbmV3IFJlZ0V4cCgnXicgKyByZWcgKyAnJCcpLFxuXHRcdFx0dG9rZW5zLFxuXHRcdH07XG5cdH1cbn1cbiJdfQ==