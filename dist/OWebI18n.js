import OWebEvent from './OWebEvent';
import { assign, forEach, isPlainObject, isString } from './utils';
import { default as defaultLangs } from './default/lang';
const LANG_OBJECT = Object.create(null);
// {name} | {@message} | {@app.name} | {@fr:message} | {@fr:app.name}
const TOKEN_REG = /{\s*(@)?(?:([a-z-]{2,}):)?([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)*)\s*}/gi;
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
const parse = function parser(str) {
    const out = str
        .replace(/([\r\n"'])/g, '\\$1')
        .replace(TOKEN_REG, function stringChunkReplacer(_found, isSub, lang, path) {
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
const getKey = function getKey(key, langData) {
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
const _tmp = new Map(), translate = function translate(key, data, pluralize = 0, lang) {
    const id = `${lang}:${key}`;
    let message = key, format, fn;
    if (_tmp.has(id)) {
        fn = _tmp.get(id);
    }
    else if (LANG_OBJECT[lang] && (format = getKey(key, LANG_OBJECT[lang]))) {
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
    _appContext;
    constructor(_appContext) {
        super();
        this._appContext = _appContext;
    }
    /**
     * Sets default i18n lang code.
     *
     * @deprecated use {@link OWebI18n.setLang}
     *
     * @param lang The i18n lang code.
     */
    setDefaultLang(lang) {
        return this.setLang(lang);
    }
    /**
     * Sets i18n lang code.
     *
     * @param lang The i18n lang code.
     */
    setLang(lang) {
        if (!LANG_OBJECT[lang]) {
            throw new Error(`[OWebLang] can't set default language, undefined language data for: ${lang}.`);
        }
        this._appContext.configs.set('OW_APP_DEFAULT_LANG', lang);
        return this;
    }
    /**
     * Gets current lang.
     *
     * @returns {string}
     */
    getCurrentLang() {
        return this._appContext.configs.get('OW_APP_DEFAULT_LANG');
    }
    /**
     * Gets supported languages.
     *
     * @returns {string[]}
     */
    getSupportedLangs() {
        return Object.keys(LANG_OBJECT);
    }
    /**
     * Returns i18n translation.
     *
     * @param key The i18n string key.
     * @param data The data to inject in translation process.
     * @param pluralize
     * @param lang The i18n lang code to use.
     */
    toHuman(key, data = {}, pluralize = 0, lang) {
        lang = lang || this.getCurrentLang();
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
        const { nodeName } = el, isInput = nodeName === 'INPUT' || nodeName === 'TEXTAREA', { text, placeholder, title, data = {}, lang = this.getCurrentLang(), pluralize, } = options;
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
    }
}
forEach(defaultLangs, function loadDefaultLangsData(value, code) {
    OWebI18n.loadLangData(code, value);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkkxOG4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkkxOG4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDbkUsT0FBTyxFQUFFLE9BQU8sSUFBSSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQTRCekQsTUFBTSxXQUFXLEdBQXVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUUscUVBQXFFO0FBQ3JFLE1BQU0sU0FBUyxHQUNkLDJFQUEyRSxDQUFDO0FBRTdFOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQU0sS0FBSyxHQUFHLFNBQVMsTUFBTSxDQUFDLEdBQVc7SUFDeEMsTUFBTSxHQUFHLEdBQUcsR0FBRztTQUNiLE9BQU8sQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDO1NBQzlCLE9BQU8sQ0FDUCxTQUFTLEVBQ1QsU0FBUyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJO1FBQ3JELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULElBQUksS0FBSyxFQUFFO1lBQ1YsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUNsQyxDQUFDLEdBQUcsUUFBUSxJQUFJLFVBQVUsSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDO1NBQy9DO2FBQU07WUFDTixDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNoQjtRQUVELE9BQU8sSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQyxDQUNELENBQUM7SUFFSCxPQUFPLElBQUksUUFBUSxDQUNsQixH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UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxTQUFTLENBQ2xCLDJEQUEyRCxDQUMzRCxDQUFDO1NBQ0Y7UUFFRCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUNEO0FBRUQsT0FBTyxDQUFDLFlBQVksRUFBRSxTQUFTLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJO0lBQzlELFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT0pTT05WYWx1ZSB9IGZyb20gJy4vT1dlYkRhdGFTdG9yZSc7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcbmltcG9ydCB7IGFzc2lnbiwgZm9yRWFjaCwgaXNQbGFpbk9iamVjdCwgaXNTdHJpbmcgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGRlZmF1bHQgYXMgZGVmYXVsdExhbmdzIH0gZnJvbSAnLi9kZWZhdWx0L2xhbmcnO1xuaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcblxuZXhwb3J0IHR5cGUgT0kxOG5EZWZpbml0aW9uID0gUmVjb3JkPHN0cmluZywgT0pTT05WYWx1ZT47XG5leHBvcnQgdHlwZSBPSTE4bkRhdGEgPSB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xuZXhwb3J0IHR5cGUgT0kxOG5PcHRpb25zID0ge1xuXHR0ZXh0Pzogc3RyaW5nO1xuXHRsYW5nPzogc3RyaW5nO1xuXHRkYXRhPzogT0kxOG5EYXRhO1xuXHRwbHVyYWxpemU/OiBPSTE4blBsdXJhbGl6ZTtcbn07XG5leHBvcnQgdHlwZSBPSTE4biA9IE9JMThuT3B0aW9ucyB8IHN0cmluZztcblxuZXhwb3J0IHR5cGUgT0kxOG5FbGVtZW50ID1cblx0fCBzdHJpbmdcblx0fCB7XG5cdFx0XHR0ZXh0Pzogc3RyaW5nO1xuXHRcdFx0cGxhY2Vob2xkZXI/OiBzdHJpbmc7XG5cdFx0XHR0aXRsZT86IHN0cmluZztcblx0XHRcdGxhbmc/OiBzdHJpbmc7XG5cdFx0XHRkYXRhPzogT0kxOG5EYXRhO1xuXHRcdFx0cGx1cmFsaXplPzogT0kxOG5QbHVyYWxpemU7XG5cdCAgfTtcblxuZXhwb3J0IHR5cGUgT0kxOG5QbHVyYWxpemUgPVxuXHR8IG51bWJlclxuXHR8ICgoZGF0YTogT0kxOG5EYXRhLCBwYXJ0czogc3RyaW5nW10pID0+IG51bWJlcik7XG5cbmNvbnN0IExBTkdfT0JKRUNUOiB7IFtrZXk6IHN0cmluZ106IE9JMThuRGVmaW5pdGlvbiB9ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbi8vIHtuYW1lfSB8IHtAbWVzc2FnZX0gfCB7QGFwcC5uYW1lfSB8IHtAZnI6bWVzc2FnZX0gfCB7QGZyOmFwcC5uYW1lfVxuY29uc3QgVE9LRU5fUkVHID1cblx0L3tcXHMqKEApPyg/OihbYS16LV17Mix9KTopPyhbYS16X11bYS16MC05X10qKD86XFwuW2Etel9dW2EtejAtOV9dKikqKVxccyp9L2dpO1xuXG4vKipcbiAqIGBgYGpzXG4gKlxuICogY29uc3Qgc2FtcGxlcyA9IHtcbiAqICBtZXNzYWdlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ0hlbGxvIFdvcmxkIScsXG4gKiAgbWVzc2FnZV93aXRoX3Rva2VuICAgICAgICAgICAgICAgICAgICA6ICdIZWxsbyB7bmFtZX0hJyxcbiAqICBtZXNzYWdlX3dpdGhfcGx1cmFsaXplICAgICAgICAgICAgICAgIDogJ29uZSBtZXNzYWdlIH4gdHdvIG1lc3NhZ2VzIH4ge259IG1lc3NhZ2VzJyxcbiAqICBtZXNzYWdlX3dpdGhfc3ViX21lc3NhZ2UgICAgICAgICAgICAgIDogJ3tAbWVzc2FnZV93aXRoX3Rva2VufSBXZWxjb21lIHRvIG91ciB3ZWJzaXRlLicsXG4gKiAgbWVzc2FnZV93aXRoX3N1Yl9tZXNzYWdlX2RlZXAgICAgICAgICA6ICdBcHAgbmFtZSBpczoge0BhcHAubmFtZX0uJyxcbiAqICBtZXNzYWdlX3dpdGhfc3ViX21lc3NhZ2Vfc3BlY2lmaWNfbGFuZzogJ3tAZnI6bWVzc2FnZV93aXRoX3Rva2VufSBXZSBzcGVhayBmcmVuY2ggdG9vIScsXG4gKiAgYXBwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHtcbiAqIFx0XHRuYW1lOiAnTWFnaWNBcHAnXG4gKiBcdH1cbiAqIH07XG4gKiBgYGBcbiAqL1xuY29uc3QgcGFyc2UgPSBmdW5jdGlvbiBwYXJzZXIoc3RyOiBzdHJpbmcpIHtcblx0Y29uc3Qgb3V0ID0gc3RyXG5cdFx0LnJlcGxhY2UoLyhbXFxyXFxuXCInXSkvZywgJ1xcXFwkMScpXG5cdFx0LnJlcGxhY2UoXG5cdFx0XHRUT0tFTl9SRUcsXG5cdFx0XHRmdW5jdGlvbiBzdHJpbmdDaHVua1JlcGxhY2VyKF9mb3VuZCwgaXNTdWIsIGxhbmcsIHBhdGgpIHtcblx0XHRcdFx0bGV0IGwsIHg7XG5cdFx0XHRcdGlmIChpc1N1Yikge1xuXHRcdFx0XHRcdGwgPSBsYW5nID8gJ1wiJyArIGxhbmcgKyAnXCInIDogJ2wnO1xuXHRcdFx0XHRcdHggPSBgXyhkW1wiJHtwYXRofVwiXSB8fCBcIiR7cGF0aH1cIiwgZCwgMCwgJHtsfSlgO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHggPSAnZC4nICsgcGF0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiAnXCIrJyArIHggKyAnK1wiJztcblx0XHRcdH1cblx0XHQpO1xuXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oXG5cdFx0J18nLFxuXHRcdCdkJyxcblx0XHQnbCcsXG5cdFx0YHJldHVybiBbXCIke291dH1cIl07YC5yZXBsYWNlKC9cXHM/flxccz8vZywgJ1wiLFwiJylcblx0KTtcbn07XG5jb25zdCBnZXRLZXkgPSBmdW5jdGlvbiBnZXRLZXkoa2V5OiBzdHJpbmcsIGxhbmdEYXRhOiBhbnkpIHtcblx0Y29uc3QgcGFydHMgPSAoa2V5IHx8ICcnKS5zcGxpdCgnLicpO1xuXHRsZXQgbWVzc2FnZSA9IGxhbmdEYXRhO1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IG1lc3NhZ2UgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0bWVzc2FnZSA9IG1lc3NhZ2VbcGFydHNbaV1dIHx8IHVuZGVmaW5lZDtcblx0fVxuXG5cdHJldHVybiBtZXNzYWdlO1xufTtcblxuY29uc3QgX3RtcCA9IG5ldyBNYXAoKSxcblx0dHJhbnNsYXRlID0gZnVuY3Rpb24gdHJhbnNsYXRlKFxuXHRcdGtleTogc3RyaW5nLFxuXHRcdGRhdGE6IE9JMThuRGF0YSxcblx0XHRwbHVyYWxpemU6IE9JMThuUGx1cmFsaXplID0gMCxcblx0XHRsYW5nOiBzdHJpbmdcblx0KTogc3RyaW5nIHtcblx0XHRjb25zdCBpZCA9IGAke2xhbmd9OiR7a2V5fWA7XG5cdFx0bGV0IG1lc3NhZ2UgPSBrZXksXG5cdFx0XHRmb3JtYXQsXG5cdFx0XHRmbjtcblxuXHRcdGlmIChfdG1wLmhhcyhpZCkpIHtcblx0XHRcdGZuID0gX3RtcC5nZXQoaWQpO1xuXHRcdH0gZWxzZSBpZiAoTEFOR19PQkpFQ1RbbGFuZ10gJiYgKGZvcm1hdCA9IGdldEtleShrZXksIExBTkdfT0JKRUNUW2xhbmddKSkpIHtcblx0XHRcdF90bXAuc2V0KGlkLCAoZm4gPSBwYXJzZShmb3JtYXQpKSk7XG5cdFx0fVxuXG5cdFx0aWYgKGZuKSB7XG5cdFx0XHRjb25zdCBwYXJ0cyA9IGZuKHRyYW5zbGF0ZSwgZGF0YSwgbGFuZyksXG5cdFx0XHRcdGxlbiA9IHBhcnRzLmxlbmd0aDtcblx0XHRcdGxldCBpbmRleDtcblxuXHRcdFx0aWYgKHR5cGVvZiBwbHVyYWxpemUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0aW5kZXggPSBwbHVyYWxpemUoZGF0YSwgcGFydHMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW5kZXggPSBwbHVyYWxpemU7XG5cdFx0XHR9XG5cblx0XHRcdGluZGV4ID0gTWF0aC5tYXgoTWF0aC5taW4oaW5kZXgsIGxlbiAtIDEpLCAwKTtcblx0XHRcdG1lc3NhZ2UgPSBwYXJ0c1tpbmRleF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1lc3NhZ2U7XG5cdH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJJMThuIGV4dGVuZHMgT1dlYkV2ZW50IHtcblxuXHRjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2FwcENvbnRleHQ6IE9XZWJBcHApIHtzdXBlcigpO31cblxuXHQvKipcblx0ICogU2V0cyBkZWZhdWx0IGkxOG4gbGFuZyBjb2RlLlxuXHQgKlxuXHQgKiBAZGVwcmVjYXRlZCB1c2Uge0BsaW5rIE9XZWJJMThuLnNldExhbmd9XG5cdCAqXG5cdCAqIEBwYXJhbSBsYW5nIFRoZSBpMThuIGxhbmcgY29kZS5cblx0ICovXG5cdHNldERlZmF1bHRMYW5nKGxhbmc6IHN0cmluZyk6IHRoaXMge1xuXHRcdHJldHVybiB0aGlzLnNldExhbmcobGFuZyk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBpMThuIGxhbmcgY29kZS5cblx0ICpcblx0ICogQHBhcmFtIGxhbmcgVGhlIGkxOG4gbGFuZyBjb2RlLlxuXHQgKi9cblx0c2V0TGFuZyhsYW5nOiBzdHJpbmcpOiB0aGlzIHtcblx0XHRpZiAoIUxBTkdfT0JKRUNUW2xhbmddKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdGBbT1dlYkxhbmddIGNhbid0IHNldCBkZWZhdWx0IGxhbmd1YWdlLCB1bmRlZmluZWQgbGFuZ3VhZ2UgZGF0YSBmb3I6ICR7bGFuZ30uYFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0aGlzLl9hcHBDb250ZXh0LmNvbmZpZ3Muc2V0KCdPV19BUFBfREVGQVVMVF9MQU5HJywgbGFuZyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGN1cnJlbnQgbGFuZy5cblx0ICpcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICovXG5cdGdldEN1cnJlbnRMYW5nKCk6c3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fYXBwQ29udGV4dC5jb25maWdzLmdldCgnT1dfQVBQX0RFRkFVTFRfTEFORycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc3VwcG9ydGVkIGxhbmd1YWdlcy5cblx0ICpcblx0ICogQHJldHVybnMge3N0cmluZ1tdfVxuXHQgKi9cblx0Z2V0U3VwcG9ydGVkTGFuZ3MoKTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyhMQU5HX09CSkVDVCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBpMThuIHRyYW5zbGF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBpMThuIHN0cmluZyBrZXkuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGluamVjdCBpbiB0cmFuc2xhdGlvbiBwcm9jZXNzLlxuXHQgKiBAcGFyYW0gcGx1cmFsaXplXG5cdCAqIEBwYXJhbSBsYW5nIFRoZSBpMThuIGxhbmcgY29kZSB0byB1c2UuXG5cdCAqL1xuXHR0b0h1bWFuKFxuXHRcdGtleTogT0kxOG4sXG5cdFx0ZGF0YTogT0kxOG5EYXRhID0ge30sXG5cdFx0cGx1cmFsaXplOiBPSTE4blBsdXJhbGl6ZSA9IDAsXG5cdFx0bGFuZz86IHN0cmluZ1xuXHQpOiBzdHJpbmcge1xuXG5cdFx0bGFuZyA9IGxhbmcgfHwgdGhpcy5nZXRDdXJyZW50TGFuZygpO1xuXG5cdFx0aWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRjb25zdCBvcHQgPSBrZXkgYXMgT0kxOG5PcHRpb25zO1xuXHRcdFx0cmV0dXJuIHRyYW5zbGF0ZShcblx0XHRcdFx0b3B0LnRleHQgfHwgJycsXG5cdFx0XHRcdG9wdC5kYXRhIHx8IGRhdGEsXG5cdFx0XHRcdG9wdC5wbHVyYWxpemUgfHwgcGx1cmFsaXplLFxuXHRcdFx0XHRvcHQubGFuZyB8fCBsYW5nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cmFuc2xhdGUoa2V5LCBkYXRhLCBwbHVyYWxpemUsIGxhbmcpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgaTE4biBmb3IgSFRNTEVsZW1lbnRcblx0ICpcblx0ICogQHBhcmFtIGVsXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRlbChlbDogSFRNTEVsZW1lbnQsIG9wdGlvbnM6IE9JMThuRWxlbWVudCk6IHZvaWQge1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdG9wdGlvbnMgPSB7IHRleHQ6IG9wdGlvbnMgfTtcblx0XHR9XG5cblx0XHRjb25zdCB7IG5vZGVOYW1lIH0gPSBlbCxcblx0XHRcdGlzSW5wdXQgPSBub2RlTmFtZSA9PT0gJ0lOUFVUJyB8fCBub2RlTmFtZSA9PT0gJ1RFWFRBUkVBJyxcblx0XHRcdHtcblx0XHRcdFx0dGV4dCxcblx0XHRcdFx0cGxhY2Vob2xkZXIsXG5cdFx0XHRcdHRpdGxlLFxuXHRcdFx0XHRkYXRhID0ge30sXG5cdFx0XHRcdGxhbmcgPSB0aGlzLmdldEN1cnJlbnRMYW5nKCksXG5cdFx0XHRcdHBsdXJhbGl6ZSxcblx0XHRcdH0gPSBvcHRpb25zO1xuXHRcdGxldCBzdHI7XG5cblx0XHRpZiAodGV4dCkge1xuXHRcdFx0c3RyID0gdHJhbnNsYXRlKHRleHQsIGRhdGEsIHBsdXJhbGl6ZSwgbGFuZyk7XG5cdFx0XHRpZiAoIWlzSW5wdXQpIHtcblx0XHRcdFx0ZWwuaW5uZXJIVE1MID0gc3RyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHN0cik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGlzSW5wdXQgJiYgcGxhY2Vob2xkZXIpIHtcblx0XHRcdHN0ciA9IHRyYW5zbGF0ZShwbGFjZWhvbGRlciwgZGF0YSwgcGx1cmFsaXplLCBsYW5nKTtcblx0XHRcdGVsLnNldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInLCBzdHIpO1xuXHRcdH1cblxuXHRcdGlmICh0aXRsZSkge1xuXHRcdFx0c3RyID0gdHJhbnNsYXRlKHRpdGxlLCBkYXRhLCBwbHVyYWxpemUsIGxhbmcpO1xuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCd0aXRsZScsIHN0cik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGkxOG4gbGFuZyBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gbGFuZyBUaGUgaTE4biBsYW5nIGNvZGVcblx0ICogQHBhcmFtIGRhdGEgVGhlIGkxOG4gbGFuZyBkYXRhLlxuXHQgKi9cblx0c3RhdGljIGxvYWRMYW5nRGF0YShsYW5nOiBzdHJpbmcsIGRhdGE6IE9JMThuRGVmaW5pdGlvbik6IHZvaWQge1xuXHRcdGlmICghaXNTdHJpbmcobGFuZykpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkkxOG5dIHlvdXIgbGFuZyBuYW1lIHNob3VsZCBiZSBhIHZhbGlkIHN0cmluZy4nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICghaXNQbGFpbk9iamVjdChkYXRhKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViSTE4bl0geW91ciBsYW5nIGRhdGEgc2hvdWxkIGJlIGEgdmFsaWQgcGxhaW4gb2JqZWN0Lidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0TEFOR19PQkpFQ1RbbGFuZ10gPSBhc3NpZ24oTEFOR19PQkpFQ1RbbGFuZ10gfHwge30sIGRhdGEpO1xuXHR9XG59XG5cbmZvckVhY2goZGVmYXVsdExhbmdzLCBmdW5jdGlvbiBsb2FkRGVmYXVsdExhbmdzRGF0YSh2YWx1ZSwgY29kZSkge1xuXHRPV2ViSTE4bi5sb2FkTGFuZ0RhdGEoY29kZSwgdmFsdWUpO1xufSk7XG4iXX0=