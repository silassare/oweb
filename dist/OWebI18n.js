import OWebEvent from './OWebEvent';
import { assign, isPlainObject, isString } from './utils';
const LANG_OBJECT = {};
// {name} | {@message} | {@app.name} | {@fr:message} | {@fr:app.name}
const TOKEN_REG = /{\s*(@)?(?:([a-z-]{2,})\:)?((?:[a-z_][a-z0-9_]*)(?:\.[a-z_][a-z0-9_]*)*)\s*}/gi;
/**
 * ```js
 *
 * const samples = {
 *  message                               : 'Hello World!',
 *  message_with_token                    : 'Hello {name}!',
 *  message_with_pluralize                : 'one message ~ two messages ~ {n} messages',
 *  message_with_sub_message              : '{@message_with_token} Welcome to our website.',
 *  message_with_sub_message_deep         : 'App name is: {@app.name}.',
 *  message_with_sub_message_specific_lang: '{@fr:message_with_token} We speak french too!',
 *  app                                   : {
 * 		name: 'MagicApp'
 * 	}
 * };
 * ```
 */
const parse = function (str) {
    const out = str
        .replace(/([\r\n"'])/g, '\\$1')
        .replace(TOKEN_REG, function (found, isSub, lang, path) {
        let l, x;
        if (isSub) {
            l = lang ? '"' + lang + '"' : 'l';
            x = `_(d["${path}"] || "${path}", d, 0, ${l})`;
        }
        else {
            x = 'd.' + path;
        }
        return '"+' + x + '+"';
    });
    return new Function('_', 'd', 'l', `return ["${out}"];`.replace(/\s?~\s?/g, '","'));
};
const getKey = function (key, langData) {
    const parts = (key || '').split('.');
    let message = langData;
    for (let i = 0; i < parts.length; i++) {
        if (message === undefined || message === null) {
            return undefined;
        }
        message = message[parts[i]] || undefined;
    }
    return message;
};
const _tmp = new Map(), translate = function (key, data, pluralize = 0, lang) {
    const id = `${lang}:${key}`;
    let message = key, format, fn;
    if (_tmp.has(id)) {
        fn = _tmp.get(id);
    }
    else if (LANG_OBJECT[lang] &&
        // tslint:disable-next-line: no-conditional-assignment
        (format = getKey(key, LANG_OBJECT[lang]))) {
        _tmp.set(id, (fn = parse(format)));
    }
    if (fn) {
        const parts = fn(translate, data, lang), len = parts.length;
        let index;
        if (typeof pluralize === 'function') {
            index = pluralize(data, parts);
        }
        else {
            index = pluralize;
        }
        index = Math.max(Math.min(index, len - 1), 0);
        message = parts[index];
    }
    return message;
};
export default class OWebI18n extends OWebEvent {
    constructor() {
        super(...arguments);
        this.defaultLangCode = 'en';
    }
    /**
     * Sets default i18n lang code.
     *
     * @param lang The i18n lang code.
     */
    setDefaultLang(lang) {
        if (!LANG_OBJECT[lang]) {
            throw new Error(`[OWebLang] can't set default language, undefined language data for: ${lang}.`);
        }
        this.defaultLangCode = lang;
        return this;
    }
    /**
     * Returns i18n translation.
     *
     * @param key The i18n string key.
     * @param data The data to inject in translation process.
     * @param pluralize
     * @param lang The i18n lang code to use.
     */
    toHuman(key, data = {}, pluralize = 0, lang = this.defaultLangCode) {
        if (typeof key !== 'string') {
            const opt = key;
            return translate(opt.text || '', opt.data || data, opt.pluralize || pluralize, opt.lang || lang);
        }
        return translate(key, data, pluralize, lang);
    }
    /**
     * Sets i18n for HTMLElement
     *
     * @param el
     * @param options
     */
    el(el, options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        const { nodeName } = el, isInput = nodeName === 'INPUT' || nodeName === 'TEXTAREA', { text, placeholder, title, data = {}, lang = this.defaultLangCode, pluralize, } = options;
        let str;
        if (text) {
            str = translate(text, data, pluralize, lang);
            if (!isInput) {
                el.innerHTML = str;
            }
            else {
                el.setAttribute('value', str);
            }
        }
        if (isInput && placeholder) {
            str = translate(placeholder, data, pluralize, lang);
            el.setAttribute('placeholder', str);
        }
        if (title) {
            str = translate(title, data, pluralize, lang);
            el.setAttribute('title', str);
        }
    }
    /**
     * Sets the i18n lang data.
     *
     * @param lang The i18n lang code
     * @param data The i18n lang data.
     */
    static loadLangData(lang, data) {
        if (!isString(lang)) {
            throw new TypeError('[OWebI18n] your lang name should be a valid string.');
        }
        if (!isPlainObject(data)) {
            throw new TypeError('[OWebI18n] your lang data should be a valid plain object.');
        }
        LANG_OBJECT[lang] = assign(LANG_OBJECT[lang] || {}, data);
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkkxOG4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkkxOG4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQWtCMUQsTUFBTSxXQUFXLEdBQXVDLEVBQUUsQ0FBQztBQUMzRCxxRUFBcUU7QUFDckUsTUFBTSxTQUFTLEdBQUcsZ0ZBQWdGLENBQUM7QUFFbkc7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxLQUFLLEdBQUcsVUFBVSxHQUFXO0lBQ2xDLE1BQU0sR0FBRyxHQUFHLEdBQUc7U0FDYixPQUFPLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztTQUM5QixPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUNyRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVCxJQUFJLEtBQUssRUFBRTtZQUNWLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDbEMsQ0FBQyxHQUFHLFFBQVEsSUFBSSxVQUFVLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQztTQUMvQzthQUFNO1lBQ04sQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7U0FDaEI7UUFFRCxPQUFPLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBRUosT0FBTyxJQUFJLFFBQVEsQ0FDbEIsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUMvQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBQ0Ys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QUFJLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO1FBRUQsSUFBSSxLQUFLLEVBQUU7WUFDVixHQUFHLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzlCO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFZLEVBQUUsSUFBcUI7UUFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksU0FBUyxDQUNsQixxREFBcUQsQ0FDckQsQ0FBQztTQUNGO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QixNQUFNLElBQUksU0FBUyxDQUNsQiwyREFBMkQsQ0FDM0QsQ0FBQztTQUNGO1FBRUQsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XG5pbXBvcnQgeyBhc3NpZ24sIGlzUGxhaW5PYmplY3QsIGlzU3RyaW5nIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCB0eXBlIHRJMThuRGVmaW5pdGlvbiA9IHsgW2tleTogc3RyaW5nXTogYW55IH07XG5leHBvcnQgdHlwZSB0STE4bkRhdGEgPSB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xuZXhwb3J0IHR5cGUgdEkxOG5PcHRpb25zID0ge1xuXHR0ZXh0Pzogc3RyaW5nO1xuXHRwbGFjZWhvbGRlcj86IHN0cmluZztcblx0dGl0bGU/OiBzdHJpbmc7XG5cdGxhbmc/OiBzdHJpbmc7XG5cdGRhdGE/OiB0STE4bkRhdGE7XG5cdHBsdXJhbGl6ZT86IHRJMThuUGx1cmFsaXplO1xufTtcbmV4cG9ydCB0eXBlIHRJMThuID0gdEkxOG5PcHRpb25zIHwgc3RyaW5nO1xuXG5leHBvcnQgdHlwZSB0STE4blBsdXJhbGl6ZSA9XG5cdHwgbnVtYmVyXG5cdHwgKChkYXRhOiB0STE4bkRhdGEsIHBhcnRzOiBzdHJpbmdbXSkgPT4gbnVtYmVyKTtcblxuY29uc3QgTEFOR19PQkpFQ1Q6IHsgW2tleTogc3RyaW5nXTogdEkxOG5EZWZpbml0aW9uIH0gPSB7fTtcbi8vIHtuYW1lfSB8IHtAbWVzc2FnZX0gfCB7QGFwcC5uYW1lfSB8IHtAZnI6bWVzc2FnZX0gfCB7QGZyOmFwcC5uYW1lfVxuY29uc3QgVE9LRU5fUkVHID0gL3tcXHMqKEApPyg/OihbYS16LV17Mix9KVxcOik/KCg/OlthLXpfXVthLXowLTlfXSopKD86XFwuW2Etel9dW2EtejAtOV9dKikqKVxccyp9L2dpO1xuXG4vKipcbiAqIGBgYGpzXG4gKlxuICogY29uc3Qgc2FtcGxlcyA9IHtcbiAqICBtZXNzYWdlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ0hlbGxvIFdvcmxkIScsXG4gKiAgbWVzc2FnZV93aXRoX3Rva2VuICAgICAgICAgICAgICAgICAgICA6ICdIZWxsbyB7bmFtZX0hJyxcbiAqICBtZXNzYWdlX3dpdGhfcGx1cmFsaXplICAgICAgICAgICAgICAgIDogJ29uZSBtZXNzYWdlIH4gdHdvIG1lc3NhZ2VzIH4ge259IG1lc3NhZ2VzJyxcbiAqICBtZXNzYWdlX3dpdGhfc3ViX21lc3NhZ2UgICAgICAgICAgICAgIDogJ3tAbWVzc2FnZV93aXRoX3Rva2VufSBXZWxjb21lIHRvIG91ciB3ZWJzaXRlLicsXG4gKiAgbWVzc2FnZV93aXRoX3N1Yl9tZXNzYWdlX2RlZXAgICAgICAgICA6ICdBcHAgbmFtZSBpczoge0BhcHAubmFtZX0uJyxcbiAqICBtZXNzYWdlX3dpdGhfc3ViX21lc3NhZ2Vfc3BlY2lmaWNfbGFuZzogJ3tAZnI6bWVzc2FnZV93aXRoX3Rva2VufSBXZSBzcGVhayBmcmVuY2ggdG9vIScsXG4gKiAgYXBwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHtcbiAqIFx0XHRuYW1lOiAnTWFnaWNBcHAnXG4gKiBcdH1cbiAqIH07XG4gKiBgYGBcbiAqL1xuY29uc3QgcGFyc2UgPSBmdW5jdGlvbiAoc3RyOiBzdHJpbmcpIHtcblx0Y29uc3Qgb3V0ID0gc3RyXG5cdFx0LnJlcGxhY2UoLyhbXFxyXFxuXCInXSkvZywgJ1xcXFwkMScpXG5cdFx0LnJlcGxhY2UoVE9LRU5fUkVHLCBmdW5jdGlvbiAoZm91bmQsIGlzU3ViLCBsYW5nLCBwYXRoKSB7XG5cdFx0XHRsZXQgbCwgeDtcblx0XHRcdGlmIChpc1N1Yikge1xuXHRcdFx0XHRsID0gbGFuZyA/ICdcIicgKyBsYW5nICsgJ1wiJyA6ICdsJztcblx0XHRcdFx0eCA9IGBfKGRbXCIke3BhdGh9XCJdIHx8IFwiJHtwYXRofVwiLCBkLCAwLCAke2x9KWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR4ID0gJ2QuJyArIHBhdGg7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAnXCIrJyArIHggKyAnK1wiJztcblx0XHR9KTtcblxuXHRyZXR1cm4gbmV3IEZ1bmN0aW9uKFxuXHRcdCdfJyxcblx0XHQnZCcsXG5cdFx0J2wnLFxuXHRcdGByZXR1cm4gW1wiJHtvdXR9XCJdO2AucmVwbGFjZSgvXFxzP35cXHM/L2csICdcIixcIicpLFxuXHQpO1xufTtcbmNvbnN0IGdldEtleSA9IGZ1bmN0aW9uIChrZXk6IHN0cmluZywgbGFuZ0RhdGE6IGFueSkge1xuXHRjb25zdCBwYXJ0cyA9IChrZXkgfHwgJycpLnNwbGl0KCcuJyk7XG5cdGxldCBtZXNzYWdlID0gbGFuZ0RhdGE7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQgfHwgbWVzc2FnZSA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRtZXNzYWdlID0gbWVzc2FnZVtwYXJ0c1tpXV0gfHwgdW5kZWZpbmVkO1xuXHR9XG5cblx0cmV0dXJuIG1lc3NhZ2U7XG59O1xuXG5jb25zdCBfdG1wID0gbmV3IE1hcCgpLFxuXHR0cmFuc2xhdGUgPSBmdW5jdGlvbiAoXG5cdFx0a2V5OiBzdHJpbmcsXG5cdFx0ZGF0YTogdEkxOG5EYXRhLFxuXHRcdHBsdXJhbGl6ZTogdEkxOG5QbHVyYWxpemUgPSAwLFxuXHRcdGxhbmc6IHN0cmluZyxcblx0KTogc3RyaW5nIHtcblx0XHRjb25zdCBpZCA9IGAke2xhbmd9OiR7a2V5fWA7XG5cdFx0bGV0IG1lc3NhZ2UgPSBrZXksXG5cdFx0XHRmb3JtYXQsXG5cdFx0XHRmbjtcblxuXHRcdGlmIChfdG1wLmhhcyhpZCkpIHtcblx0XHRcdGZuID0gX3RtcC5nZXQoaWQpO1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRMQU5HX09CSkVDVFtsYW5nXSAmJlxuXHRcdFx0Ly8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25kaXRpb25hbC1hc3NpZ25tZW50XG5cdFx0XHQoZm9ybWF0ID0gZ2V0S2V5KGtleSwgTEFOR19PQkpFQ1RbbGFuZ10pKVxuXHRcdCkge1xuXHRcdFx0X3RtcC5zZXQoaWQsIChmbiA9IHBhcnNlKGZvcm1hdCkpKTtcblx0XHR9XG5cblx0XHRpZiAoZm4pIHtcblx0XHRcdGNvbnN0IHBhcnRzID0gZm4odHJhbnNsYXRlLCBkYXRhLCBsYW5nKSxcblx0XHRcdFx0bGVuID0gcGFydHMubGVuZ3RoO1xuXHRcdFx0bGV0IGluZGV4O1xuXG5cdFx0XHRpZiAodHlwZW9mIHBsdXJhbGl6ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRpbmRleCA9IHBsdXJhbGl6ZShkYXRhLCBwYXJ0cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbmRleCA9IHBsdXJhbGl6ZTtcblx0XHRcdH1cblxuXHRcdFx0aW5kZXggPSBNYXRoLm1heChNYXRoLm1pbihpbmRleCwgbGVuIC0gMSksIDApO1xuXHRcdFx0bWVzc2FnZSA9IHBhcnRzW2luZGV4XTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkkxOG4gZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRkZWZhdWx0TGFuZ0NvZGU6IHN0cmluZyA9ICdlbic7XG5cblx0LyoqXG5cdCAqIFNldHMgZGVmYXVsdCBpMThuIGxhbmcgY29kZS5cblx0ICpcblx0ICogQHBhcmFtIGxhbmcgVGhlIGkxOG4gbGFuZyBjb2RlLlxuXHQgKi9cblx0c2V0RGVmYXVsdExhbmcobGFuZzogc3RyaW5nKSB7XG5cdFx0aWYgKCFMQU5HX09CSkVDVFtsYW5nXSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRgW09XZWJMYW5nXSBjYW4ndCBzZXQgZGVmYXVsdCBsYW5ndWFnZSwgdW5kZWZpbmVkIGxhbmd1YWdlIGRhdGEgZm9yOiAke2xhbmd9LmAsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHRoaXMuZGVmYXVsdExhbmdDb2RlID0gbGFuZztcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgaTE4biB0cmFuc2xhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUgaTE4biBzdHJpbmcga2V5LlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBpbmplY3QgaW4gdHJhbnNsYXRpb24gcHJvY2Vzcy5cblx0ICogQHBhcmFtIHBsdXJhbGl6ZVxuXHQgKiBAcGFyYW0gbGFuZyBUaGUgaTE4biBsYW5nIGNvZGUgdG8gdXNlLlxuXHQgKi9cblx0dG9IdW1hbihcblx0XHRrZXk6IHRJMThuLFxuXHRcdGRhdGE6IHRJMThuRGF0YSA9IHt9LFxuXHRcdHBsdXJhbGl6ZTogdEkxOG5QbHVyYWxpemUgPSAwLFxuXHRcdGxhbmc6IHN0cmluZyA9IHRoaXMuZGVmYXVsdExhbmdDb2RlLFxuXHQpOiBzdHJpbmcge1xuXHRcdGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuXHRcdFx0Y29uc3Qgb3B0OiB0STE4bk9wdGlvbnMgPSBrZXkgYXMgYW55O1xuXHRcdFx0cmV0dXJuIHRyYW5zbGF0ZShcblx0XHRcdFx0b3B0LnRleHQgfHwgJycsXG5cdFx0XHRcdG9wdC5kYXRhIHx8IGRhdGEsXG5cdFx0XHRcdG9wdC5wbHVyYWxpemUgfHwgcGx1cmFsaXplLFxuXHRcdFx0XHRvcHQubGFuZyB8fCBsYW5nLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJhbnNsYXRlKGtleSwgZGF0YSwgcGx1cmFsaXplLCBsYW5nKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGkxOG4gZm9yIEhUTUxFbGVtZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBlbFxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKi9cblx0ZWwoZWw6IEhUTUxFbGVtZW50LCBvcHRpb25zOiB0STE4bikge1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdG9wdGlvbnMgPSB7IHRleHQ6IG9wdGlvbnMgfTtcblx0XHR9XG5cblx0XHRjb25zdCB7IG5vZGVOYW1lIH0gPSBlbCxcblx0XHRcdGlzSW5wdXQgPSBub2RlTmFtZSA9PT0gJ0lOUFVUJyB8fCBub2RlTmFtZSA9PT0gJ1RFWFRBUkVBJyxcblx0XHRcdHtcblx0XHRcdFx0dGV4dCxcblx0XHRcdFx0cGxhY2Vob2xkZXIsXG5cdFx0XHRcdHRpdGxlLFxuXHRcdFx0XHRkYXRhID0ge30sXG5cdFx0XHRcdGxhbmcgPSB0aGlzLmRlZmF1bHRMYW5nQ29kZSxcblx0XHRcdFx0cGx1cmFsaXplLFxuXHRcdFx0fSA9IG9wdGlvbnM7XG5cdFx0bGV0IHN0cjtcblxuXHRcdGlmICh0ZXh0KSB7XG5cdFx0XHRzdHIgPSB0cmFuc2xhdGUodGV4dCwgZGF0YSwgcGx1cmFsaXplLCBsYW5nKTtcblx0XHRcdGlmICghaXNJbnB1dCkge1xuXHRcdFx0XHRlbC5pbm5lckhUTUwgPSBzdHI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgc3RyKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoaXNJbnB1dCAmJiBwbGFjZWhvbGRlcikge1xuXHRcdFx0c3RyID0gdHJhbnNsYXRlKHBsYWNlaG9sZGVyLCBkYXRhLCBwbHVyYWxpemUsIGxhbmcpO1xuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicsIHN0cik7XG5cdFx0fVxuXG5cdFx0aWYgKHRpdGxlKSB7XG5cdFx0XHRzdHIgPSB0cmFuc2xhdGUodGl0bGUsIGRhdGEsIHBsdXJhbGl6ZSwgbGFuZyk7XG5cdFx0XHRlbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgc3RyKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgaTE4biBsYW5nIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSBsYW5nIFRoZSBpMThuIGxhbmcgY29kZVxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgaTE4biBsYW5nIGRhdGEuXG5cdCAqL1xuXHRzdGF0aWMgbG9hZExhbmdEYXRhKGxhbmc6IHN0cmluZywgZGF0YTogdEkxOG5EZWZpbml0aW9uKSB7XG5cdFx0aWYgKCFpc1N0cmluZyhsYW5nKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViSTE4bl0geW91ciBsYW5nIG5hbWUgc2hvdWxkIGJlIGEgdmFsaWQgc3RyaW5nLicsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICghaXNQbGFpbk9iamVjdChkYXRhKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViSTE4bl0geW91ciBsYW5nIGRhdGEgc2hvdWxkIGJlIGEgdmFsaWQgcGxhaW4gb2JqZWN0LicsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdExBTkdfT0JKRUNUW2xhbmddID0gYXNzaWduKExBTkdfT0JKRUNUW2xhbmddIHx8IHt9LCBkYXRhKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG4iXX0=